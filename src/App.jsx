import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { MovieDb } from 'moviedb-promise'

const moviedb = new MovieDb(import.meta.env.VITE_API_KEY)

function App() {
  const [search_box_text, set_search_box_text] = useState('')
  const [search_results, set_search_results] = useState([])
  const [search_timeout, set_search_timeout] = useState(null)
  const [selected_movie, set_selected_movie] = useState(null)
  const [genres, set_genres] = useState([])
  const [current_genre, set_current_genre] = useState(null)
  const [current_page, set_current_page] = useState(1)
  const [total_pages, set_total_pages] = useState(1)
  const [show_torrent_queue, set_show_torrent_queue] = useState(false)
  const [torrent_queue_data, set_torrent_queue_data] = useState([])
  const [update_torrent_queue_timer, set_update_torrent_queue_timer] = useState(null)
  const handle_search_box_update = (e) => {
    // Function that fires when the search bar has a keyup event, it should wait two seconds before calling the api
    set_search_box_text(e.target.value)
    clearTimeout(search_timeout)
    // set_search_timeout(setTimeout(() => {
    //   search_movie_db(search_box_text)
    // }, 2000))
  }

  useEffect(() => {
    search_popular()
    get_torrents_progress()
    return () => clearTimeout(search_timeout)
  }, [])

  const close_torrent_queue = () => {
    set_show_torrent_queue(false)
    // clearTimeout(update_torrent_queue_timer)
  }

  const get_torrents_progress = () => {
    clearTimeout(update_torrent_queue_timer)
    // We call the same endpoint as before, but with /torrents
    // We can use this data to see how far along our torrents are in downloading
    fetch('http://192.168.1.144:8000/torrents')
      .then(res => res.json())
      .then(data => {
        set_torrent_queue_data(data)
        console.log(data)
        // When the torrent queue modal is being shown, we should periodically check the progress of the torrents
        // We should call the same endpoint as before, and update the torrent_queue_data state
        // We should set a timer to call this function every 5 seconds
        set_update_torrent_queue_timer(setTimeout(() => {
          get_torrents_progress()
        }
          , 5000))
      })
  }

  const search_movie_db = (search_query, page_num = 1) => {
    console.log("Attempting to search movie db with query: ", search_query, " and page number: ", page_num)
    close_torrent_queue()
    window.scrollTo(0, 0)
    moviedb
      .searchMovie({ query: search_query, page: page_num })
      .then((res) => {
        console.log(res)
        set_current_genre({
          id: 0,
          name: 'Search Results'
        })
        set_search_results(res.results)
        set_current_page(res.page)
        set_total_pages(res.total_pages)
      })
      .catch(console.error)
  }

  const search_popular = (page_num = 1) => {
    console.log("Attempting to search popular with page number: ", page_num)
    close_torrent_queue()
    window.scrollTo(0, 0)
    moviedb
      .moviePopular({ page: page_num })
      .then((res) => {
        console.log(res)
        set_current_genre(
          {
            id: 0,
            name: 'Popular'
          }
        )
        set_search_results(res.results)
        set_current_page(res.page)
        set_total_pages(res.total_pages)
        set_search_box_text('')
      })
      .catch(console.error)
  }

  const search_top_rated = (page_num = 1) => {
    close_torrent_queue()
    window.scrollTo(0, 0)
    moviedb
      .movieTopRated({ page: page_num })
      .then((res) => {
        console.log(res)
        set_current_genre(
          {
            id: 0,
            name: 'Top Rated'
          }
        )
        set_search_results(res.results)
        set_current_page(res.page)
        set_total_pages(res.total_pages)
        set_search_box_text('')

      })
      .catch(console.error)
  }

  const list_genres = () => {
    close_torrent_queue()
    window.scrollTo(0, 0)
    moviedb
      .genreMovieList()
      .then((res) => {
        set_search_results([])
        set_genres(res.genres)
        set_search_box_text('')
        console.log(res)
      })
      .catch(console.error)
  }

  const search_by_genre = (genre, page_num = 1) => {
    console.log("Attempting to search by genre: ", genre, " with page number: ", page_num)
    window.scrollTo(0, 0)
    close_torrent_queue()
    moviedb
      .discoverMovie({ with_genres: genre.id, page: page_num, sort_by: 'popularity.desc' })
      .then((res) => {
        console.log(res)
        set_current_genre(genre)
        set_search_results(res.results)
        set_current_page(res.page)
        set_total_pages(res.total_pages)
      })
      .catch(console.error)
  }

  const next_page = () => {
    close_torrent_queue()
    window.scrollTo(0, 0)

    // If the current page is less than the total pages, we should increment the current page
    if (current_page < total_pages) {
      set_current_page(current_page + 1)
    }

    // Depending on what we're searching for, we should call the appropriate search method with the new page request
    switch (current_genre.name) {
      case 'Popular':
        search_popular(current_page + 1)
        break
      case 'Top Rated':
        search_top_rated(current_page + 1)
        break
      case 'Search Results':
        search_movie_db(search_box_text, current_page + 1)
        break
      default:
        search_by_genre(current_genre, current_page + 1)
        break
    }
  }

  const previous_page = () => {
    close_torrent_queue()
    window.scrollTo(0, 0)

    // If the current page is greater than 1, we should decrement the current page
    if (current_page > 1) {
      set_current_page(current_page - 1)
    }

    // Depending on what we're searching for, we should call the appropriate search method with the new page request
    switch (current_genre.name) {
      case 'Popular':
        search_popular(current_page - 1)
        break
      case 'Top Rated':
        search_top_rated(current_page - 1)
        break
      case 'Search Results':
        search_movie_db(search_box_text, current_page - 1)
        break
      default:
        search_by_genre(current_genre, current_page - 1)
        break
    }
  }

  return (
    <>
      <Navbar
        search_popular={search_popular}
        search_top_rated={search_top_rated}
        list_genres={list_genres}
        get_torrents_progress={get_torrents_progress}
        set_show_torrent_queue={set_show_torrent_queue}
        torrent_queue_data={torrent_queue_data}
      />
      <input
        autoCorrect='off'
        autoCapitalize='off'
        // Also disable any spellcheck
        spellCheck='false'
        onChange={handle_search_box_update}
        // Add an enter key listener to call the search_movie_db method
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            search_movie_db(search_box_text)
          }
        }}
        value={search_box_text} type="text" placeholder="What Are We Looking For?" className="SearchBar" />
      {show_torrent_queue ? <TorrentQueueModal close_torrent_queue={close_torrent_queue} set_show_torrent_queue={set_show_torrent_queue} torrent_queue_data={torrent_queue_data} /> : null}
      {search_results.length > 0 ?
        <SearchResults
          next_page={next_page}
          previous_page={previous_page}
          current_page={current_page}
          total_pages={total_pages}
          current_genre={current_genre}
          selected_movie={selected_movie}
          set_selected_movie={set_selected_movie}
          close_torrent_queue={close_torrent_queue}
          search_results={search_results} /> : (search_box_text.length > 0 ? <p>Searching...</p> : null)}
      {selected_movie != null ? <MovieDetailsModal set_selected_movie={set_selected_movie} movie={selected_movie} /> : null}
      {/* If Genres list isn't empty, and search_results is, show genre list */}
      {genres.length > 0 && search_results.length == 0 ? <GenreList search_by_genre={search_by_genre} genres={genres} /> : null}
    </>
  )
}

function TorrentQueueModal(props) {
  // This modal should show the current torrents that are downloading
  // The torrent_data object will contain two arrays, one named "currently_downloading" and one named "queued_to_download"
  // Elements in the first array will have an eta value, and elements in the second array will not
  return (
    <div className="TorrentQueueModal">
      <div className="TorrentQueueModalCloseButton" onClick={props.close_torrent_queue}>X</div>
      {/* <h1>Torrent Queue</h1> */}
      <div className="TorrentQueueModalCurrentlyDownloading">
        <h1>Currently Downloading</h1>
        {props.torrent_queue_data.currently_downloading.map((torrent, index) => {
          return <TorrentQueueItem key={index} torrent={torrent} />
        })}
      </div>
      <div className="TorrentQueueModalQueuedToDownload">
        <h1>Queued To Download</h1>
        {props.torrent_queue_data.queued_to_download.map((torrent, index) => {
          return <TorrentQueueItem key={index} torrent={torrent} />
        })}
      </div>
    </div>
  )
}

function TorrentQueueItem(props) {
  const convert_seconds_to_readable = (seconds) => {
    let hours = Math.floor(seconds / 3600)
    seconds %= 3600
    let minutes = Math.floor(seconds / 60)
    seconds %= 60
    if (hours === 0 && minutes === 0) return `${seconds} seconds`
    if (hours === 0) return `${minutes} minutes, ${seconds} seconds`
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`
  }
  return (
    <div className="TorrentQueueItem"
      onClick={() => {
        // Clicking on a torrent queue item should send a request to the server to resume this download
        fetch(`http://192.168.1.144:8000/resume`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ torrent_hash: props.torrent.hash })
        })
          .then(res => res.json())
          .then(data => {
            console.log(data)
          })
      }}
    >
      <div
        // We're gonna have a style variable for the width of the progress bar, it should be the percentage of total_downloaded / total_size
        // If total_downloaded is null, we should set the width to 0%
        style={{
          width: props.torrent.total_downloaded != null && props.torrent.total_size != null ? `${(props.torrent.total_downloaded / props.torrent.total_size) * 100}%` : '0%'
        }}
        className="TorrentQueueItemProgressBar"></div>
      <span className="TorrentQueueItemName">{props.torrent.name}</span>
      {/* We can determine if this is downloading based on its dl_speed, if it is negative one, we are not currently downloading the item, in Megabits, so we'll have to convert from Kb on the fly */}
      <p className="TorrentQueueDLSpeed">{props.torrent.dl_speed != -1 ? `${Math.floor(props.torrent.dl_speed / 1024 / 1024)} Mb/s, ${props.torrent.peers} peers, ${props.torrent.seeds_total} total seeds` : 'Waiting To Download'}</p>

      {/* We're going to display the progress of the torrent, we can get this by getting the percentage of total_downloaded (which is bytes) and total_size (which is also bytes) */}
      {/* <p>{props.torrent.total_downloaded != null && props.torrent.total_size != null ? `${Math.floor((props.torrent.total_downloaded / props.torrent.total_size) * 100)}%` : 'Waiting To Download'}</p> */}
      {/* We should add the eta as well, which is a number of milliseconds, and turn it into a nice readable string, like 3 hours, 12 minutes, 10 seconds*/}
      <p className="TorrentQueueETA">{props.torrent.eta != null && props.torrent.dl_speed > 0 ? convert_seconds_to_readable(props.torrent.eta) : ''}</p>
    </div>
  )
}

function GenreList(props) {
  return (
    <div className="GenreList">
      {props.genres.map((genre, index) => {
        return <GenreItem
          search_by_genre={props.search_by_genre}
          key={index} genre={genre} />
      })}
    </div>
  )
}

function GenreItem(props) {
  return (
    <button
      onClick={() => { props.search_by_genre(props.genre) }}
      className="GenreItem">
      <h1>{props.genre.name}</h1>
    </button>
  )
}

function MovieDetailsModal(props) {
  const [torrent_list, set_torrent_list] = useState([])
  const [searching_for_torrents, set_searching_for_torrents] = useState(false)
  const [torrent_error, set_torrent_error] = useState(null)
  const [torrent_added, set_torrent_added] = useState(false)
  const [recommended_movies, set_recommended_movies] = useState([])
  // Create a ref to the movie details modal body so we can scroll it to the top
  const movie_details_modal_body = useRef(null)
  const release_date_ref = useRef(null)
  useEffect(() => {
    find_similar_movies(props.movie)
  }, [])
  const get_torrents = () => {
    set_searching_for_torrents(true)
    // We should search for torrents for the selected movie
    // We should set the torrent list to the results
    // We call 192.168.1.144:8000/search/{movie_title} and that will return a list of torrents
    fetch(`http://192.168.1.144:8000/search/${props.movie.title}`)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        set_torrent_list(data)
        set_searching_for_torrents(false)
      })
      .catch(err => {
        set_torrent_error('There was an error searching for torrents')
        set_searching_for_torrents(false)
      })
  }
  const request_download = (torrent_magnet_link) => {
    // We call a post to 192.168.1.144:8000/download with a body of {magnet: torrent_magnet_link}
    fetch('http://192.168.1.144:8000/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ magnet: torrent_magnet_link })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        set_torrent_added(true)
        set_torrent_list([])
      })
  }
  const find_similar_movies = (movie_search) => {
    // We use the moviedb api to find similar movies to the selected movie, using the movieRecommendations method
    moviedb
      .movieRecommendations(movie_search.id)
      .then(res => {
        console.log(res)
        // scroll the movie details modal body to the top
        movie_details_modal_body.current.scrollTo(0, 0)
        set_recommended_movies(res.results)
      })
  }
  return (
    <div className="MovieDetailsModal">
      <div className='MovieDetailsModalCloseButton' onClick={() => props.set_selected_movie(null)}>X</div>
      <div className="MovieDetailsModalHeader">
        <div className="MovieDetailsModalHeaderImage"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${props.movie.backdrop_path})`
          }}
        >
        </div>
        <h1 className="MovieDetailsModalHeaderTitle">{props.movie.title}</h1>
      </div>
      <div className="MovieDetailsModalBody"
        ref={movie_details_modal_body}
      >
        <p className="ReleaseDate"
        ref={release_date_ref}>Released {
          // props.movie.release_date, turn it into a pretty date string like "January 1st, 2022"
          new Date(props.movie.release_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }</p>
        <p>{props.movie.overview}</p>
        <div className="MovieDetailsModalDownloadContainer">
          {/* If there's no torrent_error, and we aren't searching for torrents, and the torrent_list is empty, we should show the GetTorrentsButton
            If we are searching for torrents, we should show <p>Searching...</p>
            If there is a torrent_error, we should say there's an error
            If there are torrents, we should show the TorrentList
            If the torrent is added, we should show a message saying it's added
          */}
          {torrent_error != null && torrent_added == false ? <p>{torrent_error}</p> : (searching_for_torrents ? <p>Searching...</p> : (torrent_list.length > 0 ? <TorrentList request_download={request_download} torrents={torrent_list} /> : torrent_added == false && <GetTorrentsButton get_torrents={get_torrents} />))}
          {torrent_added ? <p>Torrent Added To Download Queue</p> : null}
        </div>
        {/* Now we have a section for similar movies, these will be movie cards and will carousel so the user can see more to the right */}
        <h2>Similar Movies</h2>
        <div className="MovieDetailsModalRecommendedMovies">
          {recommended_movies.map((movie, index) => {
            return <MovieCard key={index} movie={movie} set_selected_movie={(clicked_movie)=>{
              props.set_selected_movie(clicked_movie)
              find_similar_movies(clicked_movie)
              // Scroll the body to the top
            }} />
          })}
        </div>
      </div>
    </div>
  )
}

function TorrentList(props) {
  return (
    <div className="TorrentList">
      {props.torrents.map((torrent, index) => {
        return <TorrentItem request_download={props.request_download} key={index} torrent={torrent} />
      })}
    </div>
  )
}

function TorrentItem(props) {
  // This element will have the name of the torrent, the number of seeders, and a download button
  return (
    <div className="TorrentItem">
      <span>{props.torrent.name}</span>
      <p>Seeders: {props.torrent.seeder_count}</p>
      <button
        onClick={() => { props.request_download(props.torrent.magnet) }}
      >Download</button>
    </div>
  )
}


function GetTorrentsButton(props) {
  return (
    <button onClick={props.get_torrents} className="DownloadButton">Find Torrents</button>
  )
}

function SearchResults(props) {
  return (
    <div className="SearchResults"
      // If the background of the page is clicked, we should clear the selected movie
      onClick={() => {
        if (props.selected_movie != null){
          props.set_selected_movie(null);
        }
        props.close_torrent_queue();
      }}
    >
      {props.current_genre != null ? <h1>{props.current_genre.name}</h1> : null}
      {props.search_results.map((movie, index) => {
        return <MovieCard set_selected_movie={props.set_selected_movie} key={index} movie={movie} />
      })}

      <div className="Pagination">
        {props.current_page > 1 ? <button onClick={() => { props.previous_page() }}>Previous</button> : null}
        <p>{props.current_page} of {props.total_pages}</p>
        {props.current_page < props.total_pages ? <button onClick={() => { props.next_page() }}>Next</button> : null}
      </div>
    </div>
  )
}

function MovieCard(props) {
  return (
    // IF props.movie.poster_path is undefined, we will center the title veritcally and horizontally
    // Give the moviecard a css variable which is the background image url of the poster_path
    <div className="MovieCard"
      onClick={() => props.set_selected_movie(props.movie)}
      style={{
        backgroundImage: props.movie.poster_path == undefined ? 'none' : `url(https://image.tmdb.org/t/p/w780${props.movie.poster_path})`
      }}
    >
      <h1 className={props.movie.poster_path == undefined ? "MovieTitle Centered" : "MovieTitle"}>{props.movie.title}</h1>
    </div>
  )
}


function Navbar(props) {
  return (
    <div className="Navbar">
      {props.torrent_queue_data.currently_downloading != undefined ?
        <div className="ProgressBar"
        style={{
          // The width of the progress bar is determined by the progress on the currently downloading torrent
          // If there is no progress, we should set the width to 0%
          width: props.torrent_queue_data.currently_downloading.length > 0 ? `${(props.torrent_queue_data.currently_downloading[0].total_downloaded / props.torrent_queue_data.currently_downloading[0].total_size) * 100}%` : '0%'
        }}
      ></div> : null}
      

      {/* A bunch of buttons to call methods for searching things like popular, top rated and such */}
      <button onClick={() => {
        props.search_popular()
      }}>Popular</button>
      <button onClick={() => {
        props.search_top_rated()
      }}>Top Rated</button>
      {/* Also a button for Genres */}
      <button onClick={props.list_genres}>Genres</button>
      {/* Button to check torrents progress */}
      <button onClick={()=>{
        props.set_show_torrent_queue(true)
      }}>Torrents</button>
    </div>
  )
}

export default App
