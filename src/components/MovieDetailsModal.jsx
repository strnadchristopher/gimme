import React, { useState, useEffect, useRef } from 'react';
import { MovieCard } from './MovieCard.jsx';
import { useParams } from 'react-router-dom';
export function MovieDetailsModal(props) {
  let { id } = useParams();
  let { media_type } = useParams();
  const [torrent_list, set_torrent_list] = useState([]);
  const [searching_for_torrents, set_searching_for_torrents] = useState(false);
  const [torrent_error, set_torrent_error] = useState(null);
  const [torrent_added, set_torrent_added] = useState(false);
  const [recommended_movies, set_recommended_movies] = useState([]);
  const [movie_details, set_movie_details] = useState({});
  const [movie_cast, set_movie_cast] = useState(null);
  const [movie_backdrops, set_movie_backdrops] = useState(null);
  const [current_backdrop, set_current_backdrop] = useState(0); // Create a ref to the movie details modal body so we can scroll it to the top

  const movie_details_modal_body = useRef(null);
  const release_date_ref = useRef(null);
  useEffect(() => {
    console.log("MEdia_Type: ", media_type);
    console.log("MoPvie_ID: ", id);
    find_similar_movies(id);
    get_media_details(id);
    props.close_torrent_queue();
    window.scrollTo(0, 0);
  }, [media_type,id]);

  const get_torrents = () => {
    set_searching_for_torrents(true); // We should search for torrents for the selected movie
    // We should set the torrent list to the results
    // We call 192.168.1.217:6970/search/{movie_title} and that will return a list of torrents
    let search_query = media_type == 'movies' ? movie_details.title : movie_details.name;

    fetch(`http://192.168.1.217:6970/search/${search_query}`).then(res => res.json()).then(data => {
      console.log(data);
      set_torrent_list(data);
      set_searching_for_torrents(false);
    }).catch(err => {
      set_torrent_error('There was an error searching for torrents');
      set_searching_for_torrents(false);
    });
  };

  const request_download = torrent_magnet_link => {
    // We call a post to 192.168.1.217:6970/download with a body of {magnet: torrent_magnet_link}
    fetch('http://192.168.1.217:6970/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        magnet: torrent_magnet_link
      })
    }).then(res => res.json()).then(data => {
      console.log(data);
      set_torrent_added(true);
      set_torrent_list([]);
      window.scrollTo(0, 0);
    });
  };

  const find_similar_movies = movie_search => {
    switch (media_type) {
      case 'movies':
        // We use the movie_detailsdb api to find similar movies to the selected movie, using the movieRecommendations method
        props.moviedb.movieRecommendations(id).then(res => {
          console.log(res); // scroll the movie details modal body to the top

          movie_details_modal_body.current.scrollTo(0, 0);
          set_torrent_added(false);
          set_torrent_list([]);
          set_torrent_error(null);
          set_searching_for_torrents(false);
          set_recommended_movies(res.results);
        });
        break;
      case 'tv':
        // We use the props.moviedb api to find similar tv shows to the selected tv show, using the tvRecommendations method
        props.moviedb.tvRecommendations(id).then(res => {
          console.log(res); // scroll the movie details modal body to the top

          movie_details_modal_body.current.scrollTo(0, 0);
          set_torrent_added(false);
          set_torrent_list([]);
          set_torrent_error(null);
          set_searching_for_torrents(false);
          set_recommended_movies(res.results);
        });
        break;
    }
  };

  const get_media_details = movie_id => {
    switch (media_type) {
      case 'movies':
        // This function calls the props.moviedb api to get additional details about the movie we're currently looking at
        props.moviedb.movieInfo(movie_id).then(res => {
          console.log(res);
          set_movie_details(res);
        }); // Get the cast of the film as well

        props.moviedb.movieCredits(movie_id).then(res => {
          console.log(res);
          set_movie_cast(res);
        }); // Get the movie backdrop images as well

        props.moviedb.movieImages(movie_id).then(res => {
          console.log(res);
          set_movie_backdrops(res.backdrops);
          set_current_backdrop(0); // Pre-load the next image

          let next_backdrop = new Image();
          next_backdrop.src = `https://image.tmdb.org/t/p/original${res.backdrops[1].file_path}`; // Pre-load the previous image

          let previous_backdrop = new Image();
          previous_backdrop.src = `https://image.tmdb.org/t/p/original${res.backdrops[res.backdrops.length - 1].file_path}`;
        });
        break;
      case 'tv':
        // This function calls the props.moviedb api to get additional details about the tv show we're currently looking at
        props.moviedb.tvInfo(movie_id).then(res => {
          console.log(res);
          set_movie_details(res);
        }); // Get the cast of the tv show as well

        props.moviedb.tvCredits(movie_id).then(res => {
          console.log(res);
          set_movie_cast(res);
        }); // Get the tv show backdrop images as well

        props.moviedb.tvImages(movie_id).then(res => {
          console.log(res);
          set_movie_backdrops(res.backdrops);
          set_current_backdrop(0); // Pre-load the next image

          let next_backdrop = new Image();
          next_backdrop.src = `https://image.tmdb.org/t/p/original${res.backdrops[1].file_path}`; // Pre-load the previous image

          let previous_backdrop = new Image();
          previous_backdrop.src = `https://image.tmdb.org/t/p/original${res.backdrops[res.backdrops.length - 1].file_path}`;
        });
        break;
    }

  };

  return <div className="MovieDetailsModal">
    <div className="MovieDetailsModalHeader" onContextMenu={e => {
      e.preventDefault();

      if (movie_backdrops != null) {
        if (current_backdrop == 0) {
          set_current_backdrop(movie_backdrops.length - 1); // Pre-load the previous image

          let previous_backdrop = new Image();
          previous_backdrop.src = `https://image.tmdb.org/t/p/original${movie_backdrops[movie_backdrops.length - 2].file_path}`;
        } else {
          set_current_backdrop(current_backdrop - 1); // Pre-load the previous image

          let previous_backdrop = new Image();
          previous_backdrop.src = `https://image.tmdb.org/t/p/original${movie_backdrops[current_backdrop - 2].file_path}`;
        }
      }
    }} onClick={() => {
      if (movie_backdrops != null) {
        if (current_backdrop == movie_backdrops.length - 1) {
          set_current_backdrop(0);
        } else {
          set_current_backdrop(current_backdrop + 1); // Pre-load the next image

          let next_backdrop = new Image();
          next_backdrop.src = `https://image.tmdb.org/t/p/original${movie_backdrops[current_backdrop + 2].file_path}`;
        }
      }
    }}>
      <div className="MovieDetailsModalHeaderImage" style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie_backdrops != null ? movie_backdrops[current_backdrop].file_path : ''})`
      }}>
      </div>
      <h1 className="MovieDetailsModalHeaderTitle">{
        // If the Media Type is a movie, we will display the title of the movie
        // If the Media Type is a TV Show, we will display the name of the TV Show
        media_type == "movies" ? movie_details.title : movie_details.name
      }</h1>
    </div>
    <div className="MovieDetailsModalBody" ref={movie_details_modal_body}>
      {movie_details != null && movie_details.tagline != "" ? <p>{movie_details.tagline}</p> : null}
      {
        /* List genres in a comma seperated list, if movie_details is not null, it will be an array movie_details.genres */
      }



      <p>{movie_details.overview}</p>

      <p className="ReleaseDate" ref={release_date_ref}>Released {// First, we figure out if the media_type is tv, if so, use first_air_date, if not, use release_date, then turn it into a pretty date string like "January 1st, 2022"
        new Date(media_type == 'tv' ? movie_details.first_air_date : movie_details.release_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>

      {movie_cast != null ? <p>Starring:{" "}
        {movie_cast.cast.slice(0, 5).map((actor, index) => {
          return actor.name;
        }).join(', ')}
      </p> : null}

      {
        /* Write director name, which is in movie_cast.crew array, and it is the element in the array with the "job" field set to "Director" */
        // If there is no director for some reason, we try to show producer, writer, or creator
      }
      {movie_cast != null ? <p>Directed By:{" "}
        {movie_cast.crew.filter(member => member.job == "Director").length > 0 ? movie_cast.crew.filter(member => member.job == "Director")[0].name : movie_cast.crew.filter(member => member.job == "Producer").length > 0 ? movie_cast.crew.filter(member => member.job == "Producer")[0].name : movie_cast.crew.filter(member => member.job == "Writer").length > 0 ? movie_cast.crew.filter(member => member.job == "Writer")[0].name : movie_cast.crew.filter(member => member.job == "Creator").length > 0 ? movie_cast.crew.filter(member => member.job == "Creator")[0].name : "Unknown"}
      </p> : null}
      

      {movie_details.genres != null ? <p>{movie_details.genres.map((genre, index) => {
        return genre.name;
      }).join(', ')}</p> : null}
      <div className="MovieDetailsModalDownloadContainer">
        {
          /* If there's no torrent_error, and we aren't searching for torrents, and the torrent_list is empty, we should show the GetTorrentsButton
           If we are searching for torrents, we should show <p>Searching...</p>
           If there is a torrent_error, we should say there's an error
           If there are torrents, we should show the TorrentList
           If the torrent is added, we should show a message saying it's added
          */
        }
        {torrent_error != null && torrent_added == false ? <p>{torrent_error}</p> : searching_for_torrents ? <p>Searching...</p> : torrent_list.length > 0 ? <TorrentList request_download={request_download} torrents={torrent_list} /> : torrent_added == false && <GetTorrentsButton get_torrents={get_torrents} />}
        {torrent_added ? <p>Torrent Added To Download Queue</p> : null}
      </div>
      {
        /* Now we have a section for similar movies, these will be movie cards and will carousel so the user can see more to the right */
      }
      <h2>Similar Movies</h2>
      <div className="MovieDetailsModalRecommendedMovies">
        {recommended_movies.map((movie, index) => {
          return <MovieCard navigate={props.navigate} media_type={media_type} key={index} movie={movie} set_selected_movie={clicked_movie => {
            props.set_selected_movie(clicked_movie);
          }} />;
        })}
      </div>
    </div>
  </div>;
}
export function TorrentList(props) {
  return <div className="TorrentList">
    {props.torrents.map((torrent, index) => {
      return <TorrentItem request_download={props.request_download} key={index} torrent={torrent} />;
    })}
  </div>;
}
export function TorrentItem(props) {
  // This element will have the name of the torrent, the number of seeders, and a download button
  return <div className="TorrentItem" onClick={() => {
    props.request_download(props.torrent.magnet);
  }}>
    <span className="TorrentItemName">{props.torrent.name}</span>
    <span className="TorrentItemSeedCount">{props.torrent.seeder_count} Seeders</span>
  </div>;
}
export function GetTorrentsButton(props) {
  return <button onClick={props.get_torrents} className="DownloadButton">Find Torrents</button>;
}
