
export function MovieCard(props) {
  return (// IF props.movie.poster_path is undefined, we will center the title veritcally and horizontally
    // Give the moviecard a css variable which is the background image url of the poster_path
    <div className="MovieCard" onClick={() => {
      props.navigate(`/${props.media_type}/details/${props.movie.id}`)
    }} style={{
      backgroundImage: props.movie.poster_path == undefined ? 'none' : `url(https://image.tmdb.org/t/p/w780${props.movie.poster_path})`
    }}>
      <h1 className={props.movie.poster_path == undefined ? "MovieTitle Centered" : "MovieTitle"}>{
        // If the Media Type is a movie, we will display the title of the movie
        // If the Media Type is a TV Show, we will display the name of the TV Show
        props.media_type == "movies" ? props.movie.title : props.movie.name
      }</h1>
    </div>
  );
}
