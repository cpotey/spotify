import React, {useState, useEffect} from 'react';
import './App.css';

import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

import SimpleSnackbar from "./components/Snackbar"
import {MainWrapper, TitleHeader, FilterButtons} from "./assets/style"

import hash from "./components/Hash";
import Header from "./components/Header";
import Button from "./components/Button";
import Loading from "./components/Loading";
import Footer from "./components/Footer"

import TopTracks from "./components/Tracks/TopTracks";
import TopArtists from "./components/Artists/TopArtists";


// API Call settings and ID's
export const authEndpoint = 'https://accounts.spotify.com/authorize';
const clientId = "0340a65a438d4610851df462daa7f480";
const redirectUri = "https://spottopapp.netlify.app";
// const redirectUri = "https://spottop.co.uk";
// const redirectUri = "http://localhost:3000";
const scopes = [
  "user-top-read",
  "playlist-modify-public"
];

function App() {

  const [token, setToken] = useState();
  const [top_artists, setTopArtists] = useState();
  const [top_tracks, setTopTracks] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState('false');
  const [activePage, setActivePage] = useState('tracks');
  const [buttons] = useState(
    [
      { filter: "long_term", name: "All-time" }, 
      { filter: "medium_term", name: "Last 6 months" },
      { filter: "short_term", name: "Last 4 weeks" },
    ]);
  const [activeID, setActiveID] = useState(1);

  // If token state changes, do the below
  useEffect(() => {
    // Set token state from hash (window.location) if exists
    let _token = hash.access_token;
    if (_token) {  
      setToken(_token);
    }
    // if token state exists, do functions to get Tracks, Artists and user details
    // (pass the setState function through as an argument to use in API_Functions file)
    if(token) {
      initialLoad(token);
    }
  }, [token])

  // Initial Load
  function initialLoad(token) {
    setLoading('true');
    axios.all([
      axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      }),
      axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: {
          Authorization: 'Bearer ' + token
        },
        params: {
          limit: 48,
          time_range: "medium_term",
        }
      }),
      axios.get('https://api.spotify.com/v1/me/top/tracks', {
        headers: {
          Authorization: 'Bearer ' + token
        },
        params: {
          limit: 48,
          time_range: "medium_term",
        }
      })
    ])
    .then(axios.spread((userDetails, TopArtists, topTracks) => {
      setUser(userDetails.data);
      setTopArtists(TopArtists.data);
      setTopTracks(topTracks.data);
      setLoading('false');
    }));
  }

  // Get Top Artists
function getTopArtists(token,trackFilter) {

  setLoading('true');
  if (!trackFilter) {
    let trackFilter = "medium_term"
  }
  axios.get('https://api.spotify.com/v1/me/top/artists', {
    headers: {
      Authorization: 'Bearer ' + token
    },
    params: {
      limit: 48,
      time_range: trackFilter,
    }
  })
  .then(response => {
    setTopArtists(response.data);
    setLoading('false');
  })
  .catch(error => {
    console.log(error);
  });
}

// Get Top Tracks
function getTopTracks(token,trackFilter) {

  setLoading('true');
  if (!trackFilter) {
    let trackFilter = "medium_term"
  }
  axios.get('https://api.spotify.com/v1/me/top/tracks', {
    headers: {
      Authorization: 'Bearer ' + token
    },
    params: {
      limit: 48,
      time_range: trackFilter,
    }
  })
  .then(response => {
    setTopTracks(response.data);
    setLoading('false');
  })
  .catch(error => {
    console.log(error);
  });
}

  function createPlaylist(token,userID,activeID,topTracksArray) {
  
    // Get all Top Tracks
    let array = topTracksArray;
    // Create an array containing just the URI's of all the tracks
    let topTrackURIArray = array.map(a => a.uri);
  
    if (activeID === 0) {
      var timeRange = 'across all-time'
      var altTimeRange = 'All-time'
    } else if (activeID === 1) {
      var timeRange = 'from the previous 6 months'
      var altTimeRange = 'Previous 6 Months'
    } else if (activeID === 2) {
      var timeRange = 'from the previous 4 weeks'
      var altTimeRange = 'Previous 4 Weeks'
    } else {
      var timeRange = ''
      var altTimeRange = ''
    }

    // Create a new Playlist for the user
    axios({
      method: 'post',
      url: `https://api.spotify.com/v1/users/${userID}/playlists`,
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      data: {
        name: `Your Top Tracks - ${altTimeRange}`,
        description: `Your top Spotify tracks ${timeRange}. Generated by SpotTop.`
      } 
    })
    .then(function (response) {
  
      let playlistID = response.data.id;
      axios({
        method: 'post',
        url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        data: {
          uris: topTrackURIArray
        } 
      }).catch(function (error) {
        console.log(error);
      });
      
    })
    .catch(function (error) {
      console.log(error);
    });
  
  }
  

// Styled Components
const ContentArea = styled.div`
  margin-bottom:3rem;

  @media screen and (max-width:1150px) {
    width: 100%;
  }
`;

const Login = styled.div`
  color:#fff;
  max-width:55%;
  text-align:left;
  font-size: 2.53rem;

  span {
    color:#1db954;
  }

  @media screen and (max-width:1150px) {
    max-width: 90%;
  }

  h3 {
    margin-top:0;
  }
  @media screen and (max-width:640px) {

    h3 {
      font-size: 2.5rem;
      
    }

    
  }
  @media screen and (max-width:400px) {
    text-align: center;
    h3 {
      font-size: 2.1rem;
      
    }

    
  }
  @media screen and (max-width:349px) {
    h3 {
      font-size: 2rem;
    } 
  }
`;

const Fixed = styled.div`
display: flex;
text-align: right;
flex-direction: column;
position: fixed;
bottom: 1.5rem;
right: 2.5rem;
align-items: flex-end;

@media screen and (max-width:450px) {
  bottom: 1rem;
  right: 0;
  left: 0;
  text-align: center;
    align-items: center;
}

.added {
  border-radius: 500px;
  padding: 1rem 2rem 0.9rem;
  text-decoration: none;
  color: #1db954;
  background-color: #fdfdfd;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  line-height: 1;
  font-size: 1rem;
  // transition: .3s ease;
  min-width: initial;
  font-family: 'Cera',-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12);

  div {
    padding:0;
  }
}
`;


  return (

  <BrowserRouter>
    <div className="App">
      <Header 
        setActivePage={setActivePage} 
        setActiveID={setActiveID} 
        token={token} 
        getTopArtists={getTopArtists}
        getTopTracks={getTopTracks} />
      <MainWrapper>
        {!token && (
          <Login>
            <h3>Login to discover your most played Spotify <span>tracks</span> and <span>artists</span>, and save them straight into a <span>playlist</span>.</h3>
            <Button hero
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=false`}
            >Login to Spotify</Button>
          </Login>
        )}
        
        <ContentArea>

        {(top_tracks) && (activePage === "tracks") ? (
          
          <div>
            <TitleHeader>
              <h1>Your Top Tracks</h1>
              
              <FilterButtons>
                {buttons.map((button, index) => (
                    <Button filter 
                        key={index} 
                        className={index === activeID? "active filter-button": "filter-button"}
                        onClick={()=>{
                            setActiveID(index);
                            getTopTracks(token,button.filter);
                        }
                        }>
                        {button.name}
                    </Button>
                    ))
                }
              </FilterButtons>
            </TitleHeader>

            <TopTracks
              data={top_tracks}
              token={token}
              setTopTracks={setTopTracks}
              getTopTracks={getTopTracks}
            />
          </div>

        
        ) : ''}
        {(top_artists) && (activePage === "artists") ? (
          
          <div>
          <TitleHeader>
              <h1>Your Top Artists</h1>

              <FilterButtons>
                {buttons.map((button, index) => (
                    <Button filter 
                        key={index} 
                        className={index === activeID? "active filter-button": "filter-button"}
                        onClick={()=>{
                            setActiveID(index);
                            getTopArtists(token,button.filter);
                        }
                        }>
                        {button.name}
                    </Button>
                    ))
                }
              </FilterButtons>
            </TitleHeader>

            <TopArtists
              data={top_artists}
            />
          </div>

        
        ) : ''}
        
        {loading === 'true' &&  (
          <Loading /> 
          )
        }
        {(user) && (top_tracks) && (activePage === "tracks") ? (
          <div>
          <Fixed>
          
            <SimpleSnackbar 
            createPlaylist={createPlaylist}
            token={token}
            userID={user.id}
            activeID={activeID}
            topTracksArray={top_tracks.items}
            
             />
            
          </Fixed>
          </div>

        ) : ''}

        </ContentArea>

      </MainWrapper>

      <Footer token={token} />
    </div>

    
  </BrowserRouter> 
  );
}

export default App;


