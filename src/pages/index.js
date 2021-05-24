import React from "react"
import CoverArt from "../images/default.jpg"
import Explicit from "../images/explicit.svg"
import Spotify from "spotify-web-api-js"
import Helmet from "react-helmet"
import * as Vibrant from "node-vibrant"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faBackward, faForward } from '@fortawesome/free-solid-svg-icons'

const scopes = 'user-read-private user-read-currently-playing';
const client_id = 'a123ae18bc7f40a1bdf7ed7b4907527a';
// const client_secret = '7020f927a66d4e41b1b704e19490dce5';
const redirect_uri = 'http://127.0.0.1:8000/';

export default class Home extends React.Component {
  constructor() {
    super();
    this.spotifyApi = new Spotify();
    this.getUserPlays = this.getUserPlays.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.previousTrack = this.previousTrack.bind(this);
    this.nextTrack = this.nextTrack.bind(this);
    this.state = { title: "Nothing is playing", artist: "Play Spotify on a device to start", albumCover: CoverArt};
  }

  rgbToHex(r, g, b) {
    const componentToHex = function(c) {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  getPallete(parent, image) {
    Vibrant.from(image).getPalette().then(function(palette) {
      let colors = [];
      let populations = [];
      let hexTmp;
      let sortedPopulations;
      
      hexTmp = parent.rgbToHex(palette["Vibrant"].rgb[0], palette["Vibrant"].rgb[1], palette["Vibrant"].rgb[2]);
      if (hexTmp.length === 7) {
          colors.push(hexTmp);
          populations.push(palette["Vibrant"].population);
      }

      hexTmp = parent.rgbToHex(palette["DarkVibrant"].rgb[0], palette["DarkVibrant"].rgb[1], palette["DarkVibrant"].rgb[2]);
      if (hexTmp.length === 7) {
          colors.push(hexTmp);
          populations.push(palette["DarkVibrant"].population);
      }

      hexTmp = parent.rgbToHex(palette["LightVibrant"].rgb[0], palette["LightVibrant"].rgb[1], palette["LightVibrant"].rgb[2]);
      if (hexTmp.length === 7) {
          colors.push(hexTmp);
          populations.push(palette["LightVibrant"].population);
      }

      hexTmp = parent.rgbToHex(palette["Muted"].rgb[0], palette["Muted"].rgb[1], palette["Muted"].rgb[2]);
      if (hexTmp.length === 7) {
          colors.push(hexTmp);
          populations.push(palette["Muted"].population);
      }

      hexTmp = parent.rgbToHex(palette["DarkMuted"].rgb[0], palette["DarkMuted"].rgb[1], palette["DarkMuted"].rgb[2]);
      if (hexTmp.length === 7) {
          colors.push(hexTmp);
          populations.push(palette["DarkMuted"].population);
      }

      hexTmp = parent.rgbToHex(palette["LightMuted"].rgb[0], palette["LightVibrant"].rgb[1], palette["LightVibrant"].rgb[2]);
      if (hexTmp.length === 7) {
          colors.push(hexTmp);
          populations.push(palette["LightMuted"].population);
      }

      sortedPopulations = JSON.stringify(populations);
      sortedPopulations = JSON.parse(sortedPopulations);
      sortedPopulations.sort(function(a, b) { return b-a });
      const colorLeft = colors[populations.indexOf(sortedPopulations[0])];
      const colorRight = colors[populations.indexOf(sortedPopulations[1])];
      parent.setState({
        colorLeft: colorLeft,
        colorRight: colorRight
      });
    });
  }

  getUserPlays(parent) {
    parent.spotifyApi.getMyCurrentPlayingTrack().then(function (data) {
      if (data.item) {
        let artist = "";
        for (let i = 0; i < data.item.artists.length; i++){
          if (i === 0) {
            artist = data.item.artists[i].name;
          } else {
            artist += ", " + data.item.artists[i].name;
          }
        }
        
        if (parent.albumCover !== data.item.album.images[0].url) {
          parent.getPallete(parent, data.item.album.images[0].url);
        }

        parent.setState({ 
          title: data.item.name, 
          artist: artist, 
          isPlaying: data.is_playing,
          albumCover: data.item.album.images[0].url,
          lengthOfSong: data.item.duration_ms,
          currentDuration: data.progress_ms,
          explicit: data.item.explicit
        });
      } else {
        parent.defaultView(parent);
      }
    },
    function (err) {
      console.log(err);
      if (err.status === 401) {
        parent.getToken();
      }
      parent.defaultView(parent);
    });
  }

  defaultView(parent) {
    parent.setState({
      title: "Nothing is playing",
      artist: "Play Spotify on a device to start",
      albumCover: CoverArt,
      explicit: false,
      currentDuration: 0
    });

    if (parent.albumCover !== CoverArt) {
      parent.getPallete(parent, CoverArt);
    }
  }

  togglePlay() {
    if (this.state.isPlaying) {
      this.spotifyApi.pause();
    } else {
      this.spotifyApi.play();
    }
  }
  
  // 404 NOT FOUND
  // 204 NO CONTENT
  // 403 FORBIDDEN

  previousTrack() {
    this.spotifyApi.skipToPrevious((err) => {
      console.log(err);
    });
  }

  nextTrack() {
    this.spotifyApi.skipToNext((err) => {
      console.log(err);
    });
  }

  componentDidMount() {
    this.getPallete(this, CoverArt);

    // const params = new URLSearchParams(window.location.search);
    const access_token = window.location.hash.substr(1).replace('access_token=', '').split('&')[0];

    if (access_token) {
      this.spotifyApi.setAccessToken(access_token);
      setInterval(() => {
        this.getUserPlays(this);
      }, 500);
    } else {
        this.getToken();
    }

    const parent = this;

    document.getElementById("imageArtworkButton").onmouseover = function() {
      parent.setState({ artworkHover: true });
    };

    document.getElementById("imageArtworkButton").onmouseout = function() {
      parent.setState({ artworkHover: false });
    };

    document.getElementById("playPauseArea").onmouseover = function() {
      parent.setState({ playPauseHover: true });
    };

    document.getElementById("playPauseArea").onmouseout = function() {
      parent.setState({ playPauseHover: false });
    };

    const handleF = (event) => {
      if (event.keyCode === 70)  {
        const page = document.getElementById("page");
        page.requestFullscreen();
      }
    };

    window.addEventListener('keydown', handleF);
  }

  getToken() {
    window.location.href = 'https://accounts.spotify.com/authorize' +
        '?response_type=token' +
        '&client_id=' + client_id +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);
  }

  render() {
    const { title, artist, albumCover, isPlaying, lengthOfSong, currentDuration, colorLeft, colorRight, artworkHover, playPauseHover, explicit } = this.state;
    const bar = (100 * (currentDuration / lengthOfSong));
    const gradient = "linear-gradient(90deg, " + colorLeft + " 0%, " + colorRight + " 100%)";
    const pausedStyle = (isPlaying && !artworkHover) ? "100%" : "70%";
    const shadow = isPlaying ? "shadow-2xl" : "shadow-none";
    const explicitTag = explicit ? (<div className="ml-2 inline-block align-middle"><img style={{ 'height': '.8em' }} className="w-auto text-white" src={ Explicit } alt="Explicit"></img></div>) : null;
    let playPause = "";

    if (playPauseHover || artworkHover) {
      if (isPlaying) {
        playPause = (
          <button aria-label="Pause track" className="focus:outline-none" onClick={ this.togglePlay }>
            <FontAwesomeIcon className="text-white opacity-60" icon={ faPause } size="6x" />
          </button>
        );
      } else {
        playPause = (
          <button aria-label="Play track" className="focus:outline-none" onClick={ this.togglePlay }>
            <FontAwesomeIcon className="text-white opacity-60" icon={ faPlay } size="6x" />
          </button>
        );
      }
    }

    return (
      <div id="page" className="flex flex-col w-screen h-screen overflow-hidden" style={{ 'background': gradient || colorLeft }}>
        <Helmet>
          <html lang="en" />
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          ></meta>
          <title>Spotify Music Viewer</title>
        </Helmet>
        <div className="flex h-full justify-center items-center relative">
          <div className="absolute grid grid-cols-3">
            <div className="flex justify-center items-center">
              <button aria-label="Previous track" className="focus:outline-none opacity-40 hover:opacity-60" onClick={ this.previousTrack }><FontAwesomeIcon className="text-white" icon={ faBackward } size="6x" /></button>
            </div>
            <div>
              <button className="focus:outline-none" id="imageArtworkButton" onClick={ this.togglePlay } style={{ "opacity": pausedStyle }}>
                <img className={ shadow + " hover:shadow-none hover:cursor-pointer rounded-md" } src={ albumCover || CoverArt } alt={ title } height="300" width="300"></img>
              </button>
            </div>
            <div className="flex justify-center items-center">
              <button aria-label="Next track" className="focus:outline-none opacity-40 hover:opacity-60" onClick={ this.nextTrack }><FontAwesomeIcon className="text-white" icon={ faForward } size="6x" /></button>
            </div>
          </div>
          <div className="z-50" id="playPauseArea">
            { playPause }
          </div>
        </div>
        <div className="relative flex flex-col w-full justify-center items-center bg-white bg-opacity-40 text-white shadow-xl" style={{ 'height' : '130px' }}>
          <div className="bg-white h-1 -top-0.5 left-0 absolute opacity-90 shadow-xl rounded-full" style={{ 'width': bar + "%" }}></div>
          <div>
            <div>
              <h1 className="text-xl">{ title }</h1>
            </div>
          </div>
          <div>
            <div className="inline-block align-middle">
              <h1 className="text-base">{ artist }</h1>
            </div>
            { explicitTag }
          </div>
        </div>
      </div>
    );
  }
}
