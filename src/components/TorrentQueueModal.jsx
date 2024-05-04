
export function TorrentQueueModal(props) {
  // This modal should show the current torrents that are downloading
  // The torrent_data object will contain two arrays, one named "currently_downloading" and one named "queued_to_download"
  // Elements in the first array will have an eta value, and elements in the second array will not
  return <div className="TorrentQueueModal">
      <div className="TorrentQueueModalCloseButton" onClick={props.close_torrent_queue}>Close</div>
      {
      /* <h1>Torrent Queue</h1> */
    }
      {props.torrent_queue_data.currently_downloading != undefined && props.torrent_queue_data.currently_downloading.length > 0 ? <div className="TorrentQueueModalCurrentlyDownloading">
            <h1>Currently Downloading</h1>
            {props.torrent_queue_data.currently_downloading.map((torrent, index) => {
        return <TorrentQueueItem is_downloading={true} key={index} torrent={torrent} />;
      })}
          </div> : null}

      {props.torrent_queue_data.queued_to_download != undefined && props.torrent_queue_data.queued_to_download.length > 0 ? <div className="TorrentQueueModalQueuedToDownload">
            <h1>Queued To Download</h1>
            {props.torrent_queue_data.queued_to_download.map((torrent, index) => {
        return <TorrentQueueItem is_downloading={false} key={index} torrent={torrent} />;
      })}
          </div> : null}

      {props.torrent_queue_data.currently_downloading != undefined && props.torrent_queue_data.currently_downloading.length == 0 && (props.torrent_queue_data.queued_to_download == undefined || props.torrent_queue_data.queued_to_download.length == 0) ? <h2 className='TorrentQueueListEmptyText'>No Torrents Currently Downloading Or In Queue</h2> : null}


    </div>;
}
export function TorrentQueueItem(props) {
  const convert_seconds_to_readable = seconds => {
    let hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    if (hours === 0 && minutes === 0) return `${seconds} seconds`;
    if (hours === 0) return `${minutes} minutes, ${seconds} seconds`;
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  return <div className="TorrentQueueItem" onClick={() => {
    // Clicking on a torrent queue item should send a request to the server to resume this download
    fetch(`http://192.168.1.217:6970/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        torrent_hash: props.torrent.hash
      })
    }).then(res => res.json()).then(data => {
      console.log(data);
    });
  }}>
      <div // We're gonna have a style variable for the width of the progress bar, it should be the percentage of total_downloaded / total_size
    // If total_downloaded is null, we should set the width to 0%
    style={{
      width: props.torrent.total_downloaded != null && props.torrent.total_size != null ? `${props.torrent.total_downloaded / props.torrent.total_size * 100}%` : '0%'
    }} className="TorrentQueueItemProgressBar"></div>
      <span className="TorrentQueueItemName">{props.torrent.name}</span>

      {props.is_downloading ? <>
          <p className="TorrentQueueDLSpeed">{props.torrent.dl_speed != -1 ? `${Math.floor(props.torrent.dl_speed / 1024 / 1024)} Mb/s, ${props.torrent.peers} peers, ${props.torrent.seeds_total} total seeds` : 'Waiting To Download'}</p>

          <p className="TorrentQueueETA">{props.torrent.eta != null && props.torrent.dl_speed > 0 ? convert_seconds_to_readable(props.torrent.eta) : ''}</p>
        </> : null}

    </div>;
}
  