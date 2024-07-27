import { MovieCard } from './components/MovieCard';
import { MovieDetailsModal, TorrentList, TorrentItem, GetTorrentsButton } from './components/MovieDetailsModal';
import { TorrentQueueModal, TorrentQueueItem } from './components/TorrentQueueModal';
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react'
import './App.css'
import { MovieDb } from 'moviedb-promise'
import { useParams } from 'react-router-dom';

const moviedb = new MovieDb(import.meta.env.VITE_API_KEY)

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search_box_text, set_search_box_text] = useState('');
  const [search_timeout, set_search_timeout] = useState(null);
  const [selected_movie, set_selected_movie] = useState(null);
  const [show_torrent_queue, set_show_torrent_queue] = useState(false);
  const [torrent_queue_data, set_torrent_queue_data] = useState([]);
  const [update_torrent_queue_timer, set_update_torrent_queue_timer] = useState(null);
  const [genre_list, set_genre_list] = useState([]);
  const [owned_movie_list, set_owned_movie_list] = useState([]);
  const [previous_magnet_list, set_previous_magnet_list] = useState([]);
  const [last_search_url, set_last_search_url] = useState(null); // This value is set when we navigate to a search page, weather its query search, or genre search, or top_rated, etc
  const [background_image_url, set_background_image_url] = useState(null);
  const tv_genre_list = [
    {
      "id": 10759,
      "name": "Action & Adventure"
    },
    {
      "id": 16,
      "name": "Animation"
    },
    {
      "id": 35,
      "name": "Comedy"
    },
    {
      "id": 80,
      "name": "Crime"
    },
    {
      "id": 99,
      "name": "Documentary"
    },
    {
      "id": 18,
      "name": "Drama"
    },
    {
      "id": 10751,
      "name": "Family"
    },
    {
      "id": 10762,
      "name": "Kids"
    },
    {
      "id": 9648,
      "name": "Mystery"
    },
    {
      "id": 10763,
      "name": "News"
    },
    {
      "id": 10764,
      "name": "Reality"
    },
    {
      "id": 10765,
      "name": "Sci-Fi & Fantasy"
    },
    {
      "id": 10766,
      "name": "Soap"
    },
    {
      "id": 10767,
      "name": "Talk"
    },
    {
      "id": 10768,
      "name": "War & Politics"
    },
    {
      "id": 37,
      "name": "Western"
    }
  ]
  const movie_genre_list = [
    {
      "id": 28,
      "name": "Action"
    },
    {
      "id": 12,
      "name": "Adventure"
    },
    {
      "id": 16,
      "name": "Animation"
    },
    {
      "id": 35,
      "name": "Comedy"
    },
    {
      "id": 80,
      "name": "Crime"
    },
    {
      "id": 99,
      "name": "Documentary"
    },
    {
      "id": 18,
      "name": "Drama"
    },
    {
      "id": 10751,
      "name": "Family"
    },
    {
      "id": 14,
      "name": "Fantasy"
    },
    {
      "id": 36,
      "name": "History"
    },
    {
      "id": 27,
      "name": "Horror"
    },
    {
      "id": 10402,
      "name": "Music"
    },
    {
      "id": 9648,
      "name": "Mystery"
    },
    {
      "id": 10749,
      "name": "Romance"
    },
    {
      "id": 878,
      "name": "Science Fiction"
    },
    {
      "id": 10770,
      "name": "TV Movie"
    },
    {
      "id": 53,
      "name": "Thriller"
    },
    {
      "id": 10752,
      "name": "War"
    },
    {
      "id": 37,
      "name": "Western"
    }
  ]

  // Startup functions
  useEffect(() => {
    get_torrents_progress();
    get_owned_movies();
    get_previous_magnet_list();
    // Add an event listener for ctrl + f, which will focus the search bar
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key == 'f') {
        e.preventDefault();
        document.querySelector('.SearchBar').focus()
      }
    })
    return () => {
      clearTimeout(search_timeout);
      // Remove the event listener when the component is unmounted
      window.removeEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key == 'f') {
          e.preventDefault();
          document.querySelector('.SearchBar').focus()
        }
      })
    }
  }, [])

  const get_owned_movies = () => {
    // fetch('http://192.168.1.217:6970/owned_list')
    // Above line but using the .env VITE_SERVER_URL variable which includes the port
    fetch(`${import.meta.env.VITE_SERVER_URL}/owned_list`)
      .then(res => res.json())
      .then(data => {
        console.log("Owned Movie List:")
        console.log(data)
        set_owned_movie_list(data)
      })
  }

  const update_owned_list = (id) => {
    console.log("Adding movie to owned list: ", id)
    fetch(`${import.meta.env.VITE_SERVER_URL}/update_owned_list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ movie_id: id })
    })
      .then(res => res.json())
      .then(data => {
        set_owned_movie_list(data)
      })
  }

  const get_previous_magnet_list = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/previous_magnet_list`)
      .then(res => res.json())
      .then(data => {
        console.log("Previous Magnet List:")
        console.log(data)
        set_previous_magnet_list(data)
      })
  }

  const update_previous_magnet_list = (magnet) => {
    console.log("Adding magnet to previous magnet list: ", magnet)
    fetch(`${import.meta.env.VITE_SERVER_URL}/update_previous_magnet_list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ magnet: magnet })
    })
      .then(res => res.json())
      .then(data => {
        set_previous_magnet_list(data)
      })
  }

  const handle_search_box_update = (e) => {
    // Function that fires when the search bar has a keyup event, it should wait two seconds before calling the api
    set_search_box_text(e.target.value)
    clearTimeout(search_timeout)
  }

  const close_torrent_queue = () => {
    set_show_torrent_queue(false)
    // clearTimeout(update_torrent_queue_timer)
  }

  const get_torrents_progress = () => {
    clearTimeout(update_torrent_queue_timer)
    // We call the same endpoint as before, but with /torrents
    // We can use this data to see how far along our torrents are in downloading
    // fetch('http://192.168.1.217:6970/torrents')
    // Above line but using the .env VITE_SERVER_URL variable which includes the port
    fetch(`${import.meta.env.VITE_SERVER_URL}/torrents`)
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

  return (
    <>
      <Navbar
        set_show_torrent_queue={set_show_torrent_queue}
        torrent_queue_data={torrent_queue_data}
        set_selected_movie={set_selected_movie}
        location={location}
        navigate={navigate}
        last_search_url={last_search_url}
      />

      {/* Search bar */}
      <SearchBar
        search_box_text={search_box_text}
        set_search_box_text={set_search_box_text}
        navigate={navigate}
        handle_search_box_update={handle_search_box_update}
        location={location}
        set_last_search_url={set_last_search_url}
      />

      <AnimatedRoutes
        set_background_image_url={set_background_image_url}
        background_image_url={background_image_url}
        navigate={navigate}
        close_torrent_queue={close_torrent_queue}
        set_search_box_text={set_search_box_text}
        set_selected_movie={set_selected_movie}
        moviedb={moviedb}
        selected_movie={selected_movie}
        show_torrent_queue={show_torrent_queue}
        tv_genre_list={tv_genre_list}
        movie_genre_list={movie_genre_list}
        torrent_queue_data={torrent_queue_data}
        update_owned_list={update_owned_list}
        owned_movie_list={owned_movie_list}
        set_last_search_url={set_last_search_url}
        last_search_url={last_search_url}
        update_previous_magnet_list={update_previous_magnet_list}
        previous_magnet_list={previous_magnet_list}
      />
    </>
  )
}

function SearchBar(props) {
  if (props.location.pathname.includes("torrents")) {
    return <div></div>
  }
  return (
    <input
      autoCorrect='off'
      autoCapitalize='off'
      // Also disable any spellcheck
      spellCheck='false'
      onChange={props.handle_search_box_update}
      // Add an enter key listener to call the search_movie_db method
      onKeyPress={(e) => {
        if (e.key === 'Enter' && props.search_box_text.length > 0) {
          e.target.blur();
          // Url encode the search box text
          let search_query = encodeURIComponent(props.search_box_text)
          // If the media type is tv, we should navigate to /tv/search/:search_query/1
          // If the media type is movies, we should navigate to /movies/search/:search_query/1
          if (window.location.pathname.includes("tv")) {
            props.navigate(`/tv/search/${search_query}/1`)
          } else {
            props.navigate(`/movies/search/${search_query}/1`)
          }
        }
      }}
      value={props.search_box_text} type="text" placeholder="What Are We Looking For?" className="SearchBar" />
  )
}

function AnimatedRoutes(props) {
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<RootRedirector navigate={props.navigate} />} />
      <Route path="/:media_type" element={<RootRedirector navigate={props.navigate} />} />
      <Route path="/:media_type/search/:search_query/:page" element={
        <SearchResults
          close_torrent_queue={props.close_torrent_queue}
          search_type={"search"}
          set_selected_movie={props.set_selected_movie}
          selected_movie={props.selected_movie}
          moviedb={props.moviedb}
          set_search_box_text={props.set_search_box_text}
          navigate={props.navigate}
          show_torrent_queue={props.show_torrent_queue}
          update_owned_list={props.update_owned_list}
          owned_movie_list={props.owned_movie_list}
          set_last_search_url={props.set_last_search_url}
          background_image_url={props.background_image_url}
          set_background_image_url={props.set_background_image_url}
        />}
      />
      <Route path="/:media_type/top_rated/:page" element={
        <SearchResults
          close_torrent_queue={props.close_torrent_queue}
          search_type={"top_rated"}
          set_selected_movie={props.set_selected_movie}
          selected_movie={props.selected_movie}
          moviedb={props.moviedb}
          set_search_box_text={props.set_search_box_text}
          navigate={props.navigate}
          show_torrent_queue={props.show_torrent_queue}
          update_owned_list={props.update_owned_list}
          owned_movie_list={props.owned_movie_list}
          set_last_search_url={props.set_last_search_url}
          background_image_url={props.background_image_url}
          set_background_image_url={props.set_background_image_url}
        />}
      />
      <Route path="/:media_type/popular/:page" element={
        <SearchResults
          close_torrent_queue={props.close_torrent_queue}
          search_type={"popular"}
          set_selected_movie={props.set_selected_movie}
          selected_movie={props.selected_movie}
          moviedb={props.moviedb}
          set_search_box_text={props.set_search_box_text}
          navigate={props.navigate}
          show_torrent_queue={props.show_torrent_queue}
          update_owned_list={props.update_owned_list}
          set_last_search_url={props.set_last_search_url}
          owned_movie_list={props.owned_movie_list}
          background_image_url={props.background_image_url}
          set_background_image_url={props.set_background_image_url}
        />}
      />
      <Route path="/:media_type/genre/:genre_id/:page" element={
        <SearchResults
          close_torrent_queue={props.close_torrent_queue}
          search_type={"genre"}
          set_selected_movie={props.set_selected_movie}
          selected_movie={props.selected_movie}
          moviedb={props.moviedb}
          set_search_box_text={props.set_search_box_text}
          navigate={props.navigate}
          show_torrent_queue={props.show_torrent_queue}
          tv_genre_list={props.tv_genre_list}
          movie_genre_list={props.movie_genre_list}
          update_owned_list={props.update_owned_list}
          owned_movie_list={props.owned_movie_list}
          set_last_search_url={props.set_last_search_url}
          background_image_url={props.background_image_url}
          set_background_image_url={props.set_background_image_url}
        />}
      />
      <Route path="/:media_type/genres" element={
        <GenreList
          close_torrent_queue={props.close_torrent_queue}
          set_search_box_text={props.set_search_box_text}
          set_selected_movie={props.set_selected_movie}
          selected_movie={props.selected_movie}
          show_torrent_queue={props.show_torrent_queue}
        />}
      />
      <Route path="/:media_type/details/:id" element={
        <MovieDetailsModal
          close_torrent_queue={props.close_torrent_queue}
          set_selected_movie={props.set_selected_movie}
          selected_movie={props.selected_movie}
          show_torrent_queue={props.show_torrent_queue}
          moviedb={props.moviedb}
          navigate={props.navigate}
          update_owned_list={props.update_owned_list}
          owned_movie_list={props.owned_movie_list}
          last_search_url={props.last_search_url}
          update_previous_magnet_list={props.update_previous_magnet_list}
          previous_magnet_list={props.previous_magnet_list}
        />}
      />
      <Route path="/torrents" element={
        <TorrentQueueModal
          close_torrent_queue={props.close_torrent_queue}
          set_show_torrent_queue={props.set_show_torrent_queue}
          torrent_queue_data={props.torrent_queue_data}
        />}
      />
    </Routes>
  )
}

function SearchResults(props) {
  const location = useLocation();
  let { media_type } = useParams(); //either tv or movie
  let { genre_id } = useParams(); //if searching by genre, the genre id
  let { search_query } = useParams(); //if searching by search query, the search query
  let { page } = useParams(); //the page number
  const [search_results, set_search_results] = useState([])
  const [current_page, set_current_page] = useState(1)
  const [total_pages, set_total_pages] = useState(1)
  const [current_genre, set_current_genre] = useState(null)

  useEffect(() => {
    // Display the right information depending on the route
    props.close_torrent_queue()
    props.set_search_box_text('')
    props.set_selected_movie(null)
    props.set_last_search_url(location.pathname)
    switch (props.search_type) {
      case "search":
        search_movie_db(search_query, page)
        break
      case "top_rated":
        search_top_rated(page)
        break
      case "popular":
        search_popular(page)
        break
      case "genre":
        search_by_genre(genre_id, page)
        break
    }
  }, [media_type, search_query, props.search_type, page])

  // When search results change, update the background image
  useEffect(() => {
    // We should get the movie backdrops from the moviedb.movieImage(movie_id) method, using the first movie in the search results, presuming that there is a search result
    if (search_results.length > 0) {
      props.moviedb.movieImages({ id: search_results[0].id }).then((res) => {

        // Load the next background image url, and once its loaded, set the background image url to the next background image url
        let next_background_image_url = `https://image.tmdb.org/t/p/original${res.backdrops[0].file_path}`
        let img = new Image()
        img.src = next_background_image_url
        img.onload = () => {
          props.set_background_image_url(next_background_image_url)
        }
      })
  }
  }, [search_results])

  // Search functions
  const search_movie_db = (search_query, page_num = 1) => {
    console.log("Attempting to search movie db with query: ", search_query, " and page number: ", page_num)
    // Depending on media_type, we will call searchMovie or searchTv
    if (media_type == "tv") {
      moviedb
        .searchTv({ query: search_query, page: page_num })
        .then((res) => {
          console.log(res)

          // If the search results are empty, we should search by movie instead, simply redirecting to the same url but with /movies instead of /tv
          // We also need to make sure that a loop isn't happeneing, we will append redirect=true to the url, and if we see that, it means that we already tried searching the other media type, so just show the empty results
          if (res.results.length == 0) {
            if (location.search.includes("redirect=true")) {
              set_search_results([])
              set_current_page(1)
              set_total_pages(1)
            } else {
              props.navigate(`/movies/search/${search_query}/${page_num}?redirect=true`)
            }
          } else {
            set_search_results(res.results)
            set_current_page(res.page)
            set_total_pages(res.total_pages)
          }
        })
        .catch(console.error)
    }
    else {
      moviedb
        .searchMovie({ query: search_query, page: page_num })
        .then((res) => {
          console.log(res)
          // If the search results are empty, we should search by tv instead, simply redirecting to the same url but with /tv instead of /movies
          // We also need to make sure that a loop isn't happeneing, we will append redirect=true to the url, and if we see that, it means that we already tried searching the other media type, so just show the empty results

          if (res.results.length == 0) {
            if (location.search.includes("redirect=true")) {
              set_search_results([])
              set_current_page(1)
              set_total_pages(1)
            } else {
              props.navigate(`/tv/search/${search_query}/${page_num}?redirect=true`)
            }
          } else {
            set_search_results(res.results)
            set_current_page(res.page)
            set_total_pages(res.total_pages)
          }
        })
        .catch(console.error)
    }
  }

  const search_popular = (page_num = 1) => {
    console.log("Attempting to search popular with page number: ", page_num)
    props.close_torrent_queue()
    window.scrollTo(0, 0)
    // Depending on media_type, we will call searchMovie or searchTv
    if (media_type == "tv") {
      moviedb
        .tvPopular({ page: page_num })
        .then((res) => {
          console.log(res)
          set_search_results(res.results)
          set_current_page(res.page)
          set_total_pages(res.total_pages)
          props.set_search_box_text('')
        })
        .catch(console.error)
    } else {
      moviedb
        .moviePopular({ page: page_num })
        .then((res) => {
          console.log(res)
          set_search_results(res.results)
          set_current_page(res.page)
          set_total_pages(res.total_pages)
          props.set_search_box_text('')
        })
        .catch(console.error)
    }
  }

  const search_top_rated = (page_num = 1) => {
    props.close_torrent_queue()
    window.scrollTo(0, 0)
    // Depending on media_type, we will call movieTopRated or tvTopRated

    if (media_type == "tv") {
      moviedb
        .tvTopRated({ page: page_num })
        .then((res) => {
          console.log(res)
          set_search_results(res.results)
          set_current_page(res.page)
          set_total_pages(res.total_pages)
          props.set_search_box_text('')
        })
        .catch(console.error)
    } else {
      moviedb
        .movieTopRated({ page: page_num })
        .then((res) => {
          console.log(res)
          set_search_results(res.results)
          set_current_page(res.page)
          set_total_pages(res.total_pages)
          props.set_search_box_text('')
        })
        .catch(console.error)
    }
  }

  const search_by_genre = (genre_id, page_num = 1) => {
    console.log("Attempting to search by genre: ", genre_id, " with page number: ", page_num)
    window.scrollTo(0, 0)
    props.close_torrent_queue()
    // Depending on media_type, we will call discoverMovie or discoverTv
    if (media_type == "tv") {
      moviedb
        .discoverTv({ with_genres: genre_id, page: page_num, sort_by: 'popularity.desc' })
        .then((res) => {
          console.log(res)
          set_search_results(res.results)
          set_current_page(res.page)
          set_total_pages(res.total_pages)
        })
        .catch(console.error)
    } else {
      moviedb
        .discoverMovie({ with_genres: genre_id, page: page_num, sort_by: 'popularity.desc' })
        .then((res) => {
          console.log(res)
          set_search_results(res.results)
          set_current_page(res.page)
          set_total_pages(res.total_pages)
        })
        .catch(console.error)
    }

  }

  const next_page = () => {
    // This function will go to the next page in whatever search we're currently doing, weather it be by genre, search query, or popular
    // If the current page is less than the total pages, or less than 500, we should increment the current page
    // We will use props.navigate to navigate to the next page, and use a switch statement to determine what the url should look like
    // For example, if we are currently in /movies/genre/16/1, we should navigate to /movies/genre/16/2
    let next_page = 0;
    if (current_page < Math.min(500, total_pages)) {
      next_page = current_page + 1
    }
    else {
      next_page = 1
    }
    switch (props.search_type) {
      case "search":
        props.navigate(`/${media_type}/search/${search_query}/${next_page}`)
        break
      case "top_rated":
        props.navigate(`/${media_type}/top_rated/${next_page}`)
        break
      case "popular":
        props.navigate(`/${media_type}/popular/${next_page}`)
        break
      case "genre":
        props.navigate(`/${media_type}/genre/${genre_id}/${next_page}`)
        break
    }
  }

  const previous_page = () => {
    // This function will go to the previous page in whatever search we're currently doing, weather it be by genre, search query, or popular
    // If the current page is greater than 1, we should decrement the current page
    // We will use props.navigate to navigate to the next page, and use a switch statement to determine what the url should look like
    // For example, if we are currently in /movies/genre/16/1, we should navigate to /movies/genre/16/0
    let previous_page = 0;
    if (current_page > 1) {
      previous_page = current_page - 1
    }
    else {
      previous_page = Math.min(500, total_pages)
    }
    switch (props.search_type) {
      case "search":
        props.navigate(`/${media_type}/search/${search_query}/${previous_page}`)
        break
      case "top_rated":
        props.navigate(`/${media_type}/top_rated/${previous_page}`)
        break
      case "popular":
        props.navigate(`/${media_type}/popular/${previous_page}`)
        break
      case "genre":
        props.navigate(`/${media_type}/genre/${genre_id}/${previous_page}`)
        break
    }
  }

  const goto_page = (page_num) => {
    // This function will go to the specified page in whatever search we're currently doing, weather it be by genre, search query, or popular
    // We will use props.navigate to navigate to the next page, and use a switch statement to determine what the url should look like
    // For example, if we are currently in /movies/genre/16/1, we should navigate to /movies/genre/16/2
    switch (props.search_type) {
      case "search":
        props.navigate(`/${media_type}/search/${search_query}/${page_num}`)
        break
      case "top_rated":
        props.navigate(`/${media_type}/top_rated/${page_num}`)
        break
      case "popular":
        props.navigate(`/${media_type}/popular/${page_num}`)
        break
      case "genre":
        props.navigate(`/${media_type}/genre/${genre_id}/${page_num}`)
        break
    }
  }

  const get_genre_name = (genre_id) => {
    // This function will get the name of the genre based on the genre_id
    // We will use the genre_list state to find the name of the genre
    // Based on the media_type, we'll either use the movie_genre_list or the tv_genre_list
    let genre_list = media_type == "tv" ? props.tv_genre_list : props.movie_genre_list
    let genre = genre_list.find((genre) => genre.id == genre_id)
    return genre.name
  }

  return (
    <motion.div className="SearchResults"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: .5 }}
      onClick={() => {
        if (props.selected_movie != null) {
          props.set_selected_movie(null)
        }
        if (props.show_torrent_queue) {
          props.close_torrent_queue()
        }
      }}
    >
      {/* Background div, which is set the a blurred image of the first search result's first poster */}
      <div className="SearchResultsBackgroundImage"
        style={{
          backgroundImage: props.background_image_url != null ? `url(${props.background_image_url})` : null
        }}
      >
        <div className="SearchResultsBackgroundImageOverlay"></div>

      </div>
      {/* We will display the search method right now as an h1 above all the other search results, if it's a search query, we'll show the search query with quotes surrounding it, if it's a genre, or top_rated, or popular, we'll show that text instead */}
      <h1 className="SearchResultsHeader">
        {props.search_type == "search" ? `Search Results for "${search_query}"`
          : props.search_type == "genre" ? `${get_genre_name(genre_id)}`
            : props.search_type == "top_rated" ? "Top Rated" : props.search_type == "popular" ? "Popular" : null}
        <br />
        {/* Then, if we're on popular, show a smaller text next to it that says "Top Rated", which acts as a link to the top rated search type. Do this vice versa as well */}
      </h1>
      {total_pages > 1 && <div className="Pagination">
        {<button disabled={false}
          onContextMenu={(e) => {
            e.preventDefault();
            goto_page(1);
          }}
          onClick={() => { previous_page() }}>{"<"}</button>}

        {/* Show current page */}
        <button
          onContextMenu={(e) => {
            e.preventDefault()
            if (current_page == 1) {
              goto_page(Math.min(total_pages, 500))
            } else {
              goto_page(Math.max(current_page - 25, 1))
            }
          }}
          onClick={() => {
            if (current_page == 500) {
              goto_page(1)
            } else {
              goto_page(Math.min(current_page + 25, total_pages))
            }
          }}
        >{current_page}</button>

        {/* Forwrd  */}
        {current_page < total_pages ? <button
          onContextMenu={
            (e) => {
              e.preventDefault()
              goto_page(Math.min(total_pages, 500))
            }
          }
          onClick={() => {
            next_page();
          }}>{">"}</button> : null}
      </div>}
      
      
      {search_results.map((movie, index) => {
        return <MovieCard update_owned_list={props.update_owned_list} owned_movie_list={props.owned_movie_list} navigate={props.navigate} media_type={media_type} set_selected_movie={props.set_selected_movie} key={index} movie={movie} />
      })}

      {total_pages > 1 && <div className="Pagination">
        {<button disabled={false}
          onContextMenu={(e) => {
            e.preventDefault();
            goto_page(1);
          }}
          onClick={() => { previous_page() }}>{"<"}</button>}

        {/* Show current page */}
        <button
          onContextMenu={(e) => {
            e.preventDefault()
            if (current_page == 1) {
              goto_page(Math.min(total_pages, 500))
            } else {
              goto_page(Math.max(current_page - 25, 1))
            }
          }}
          onClick={() => {
            if (current_page == 500) {
              goto_page(1)
            } else {
              goto_page(Math.min(current_page + 25, total_pages))
            }
          }}
        >{current_page}</button>

        {/* Forwrd  */}
        {current_page < total_pages ? <button
          onContextMenu={
            (e) => {
              e.preventDefault()
              goto_page(Math.min(total_pages, 500))
            }
          }
          onClick={() => {
            next_page();
          }}>{">"}</button> : null}
      </div>}
      {props.selected_movie != null ?
        <MovieDetailsModal moviedb={props.moviedb} media_type={media_type} close_torrent_queue={props.close_torrent_queue} set_selected_movie={props.set_selected_movie} movie={props.selected_movie} />
        : null
      }
    </motion.div>
  )
}

function RootRedirector(props) {
  let { media_type } = useParams();
  useEffect(() => {
    console.log("Redirecting to popular page of media type: ", media_type)
    // If media_type is tv or movie, we should redirect to the popular page of that media type
    if (media_type == "tv") {
      props.navigate("/tv/popular/1")
    } else {
      props.navigate("/movies/popular/1")
    }
  }, [])
  return <div></div>
}


function Navbar(props) {
  // The Links Displayed in the Navbar will differ based on location
  // If the location is /:media_type/details/:id, we should display a back button
  return (
    <div className="Navbar">
      <div className="NavbarBigLinks">
        {props.torrent_queue_data.currently_downloading != undefined ?
          <div className="ProgressBar"
            style={{
              // The width of the progress bar is determined by the progress on the currently downloading torrent
              // If there is no progress, we should set the width to 0%
              width: props.torrent_queue_data.currently_downloading.length > 0 ? `${(props.torrent_queue_data.currently_downloading[0].total_downloaded / props.torrent_queue_data.currently_downloading[0].total_size) * 100}%` : '0%'
            }}
          ></div> : null}


        {
          // If the current location is /:media_type/details/:id, we should display a back button
          (props.location.pathname.includes("details") || props.location.pathname.includes("torrents")) ?
            <>
              <button onClick={() => {
                props.navigate(-1);
              }}>Back</button>
              <button onClick={() => {
                if (props.last_search_url != null) {
                  console.log("Navigating to: ", props.last_search_url)
                  props.navigate(props.last_search_url)
                } else {
                  props.navigate(
                    props.location.pathname.includes("tv") ? "/tv/popular/1" : "/movies/popular/1"
                  )

                }
              }}>Back To Search</button>
            </> : null
        }
        {
          (props.location.pathname.includes("details") == false && props.location.pathname.includes("torrents") == false) ?
            <><NavLink
              // If We're currently on the tv media_type, this should be highlighted, do this by adding a class
              // If we're not on the tv media_type, we should not add a class
              className={props.location.pathname.includes("tv") ? "NavbarLinkActive" : "NavbarLinkInactive"}
              to="/tv/popular/1">TV</NavLink>
              <NavLink
                className={props.location.pathname.includes("tv") == false ? "NavbarLinkActive" : "NavbarLinkInactive"}
                to="/movies/popular/1">Movies</NavLink>

              {/* Button to check torrents progress */}
              <NavLink
                to="/torrents"
              >Torrents</NavLink>

            </> : null
        }
      </div>
      {/* This second half is a smaller navbar with Top-Rated and Popular links for this media_type */}
      {(props.location.pathname.includes("details") == false && props.location.pathname.includes("torrents") == false) ?
        <div className="NavbarSmallLinks">
          {/* Add a className to each link that matches the current page, i.e. if we're on popular, give it the "NavbarLinkActive" class */}
          <NavLink
            className={props.location.pathname.includes("popular") ? "NavbarLinkActive" : "NavbarLinkInactive"}
            to={`/${props.location.pathname.includes("tv") ? "tv" : "movies"}/popular/1`}>Popular</NavLink>
          <NavLink
            className={props.location.pathname.includes("top_rated") ? "NavbarLinkActive" : "NavbarLinkInactive"}
            to={`/${props.location.pathname.includes("tv") ? "tv" : "movies"}/top_rated/1`}>Top Rated</NavLink>
          <NavLink
            className={props.location.pathname.includes("genres") ? "NavbarLinkActive" : "NavbarLinkInactive"}
            to={
              props.location.pathname.includes("tv") ? "/tv/genres" : "/movies/genres"
            }>Genres</NavLink>
        </div>
        : null
      }
    </div>
  )
}

function GenreList(props) {
  const { media_type } = useParams()
  const [genres, set_genres] = useState([])
  const get_genres = () => {
    props.close_torrent_queue()
    window.scrollTo(0, 0)
    // If media type is tv, get tv genre list
    // If media type is movies, get movie genre list
    if (media_type == "tv") {
      moviedb
        .genreTvList()
        .then((res) => {
          set_genres(res.genres)
          props.set_search_box_text('')
          console.log(res)
          props.set_genre_list(res.genres)
        })
        .catch(console.error)
    } else {
      moviedb
        .genreMovieList()
        .then((res) => {
          set_genres(res.genres)
          props.set_search_box_text('')
          console.log(res)
        })
        .catch(console.error)
    }
  }
  useEffect(() => {
    props.set_selected_movie(null)
    props.close_torrent_queue()
    get_genres()
  }, [])
  return (
    <motion.div
      className="GenreList"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: .5 }}
    >
      <h1>Genres</h1>
      {genres.map((genre, index) => {
        return <GenreItem
          search_by_genre={props.search_by_genre}
          key={index} genre={genre}
          media_type={media_type}
        />
      })}
    </motion.div>
  )
}

function GenreItem(props) {
  return (
    <NavLink
      to={`/${props.media_type
        }/genre/${props.genre.id}/1`}
      className="GenreItem">
      <h1>{props.genre.name}</h1>
    </NavLink>
  )
}

export default App
