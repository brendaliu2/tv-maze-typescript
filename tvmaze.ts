import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $('#episodesList');

const BASE_URL = 'https://api.tvmaze.com';

//Interface for Show 
interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: { medium: string; } | null;
}

//Interface for Episode 
interface EpisodeInterface {
  id: number;
  name: string;
  season: string;
  number: string;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */


async function getShowsByTerm(term: string): Promise<[ShowInterface]> {

  const searchedShows = await axios.get(`${BASE_URL}/search/shows`, {
    params: { q: term }
  });

  const shows = searchedShows.data.map((s: { show: ShowInterface; }) => ({
    id: s.show.id,
    name: s.show.name,
    summary: s.show.summary,
    image: s.show.image?.medium || "https://tinyurl.com/tv-missing"
  }));
  //optional chaining show.image?.medium
  return shows;
};


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: [ShowInterface]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }

}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});



/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id: number): Promise<[EpisodeInterface]> {
  const episodes = await axios.get(`${BASE_URL}/shows/${id}/episodes`);
  return episodes.data.map((e: EpisodeInterface) => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number
  }));
}

/** Given list of episodes, create markup for each and to DOM  */

function populateEpisodes(episodes: [EpisodeInterface]) {

  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li id=${episode.id}>
      ${episode.name} (season${episode.season}, number ${episode.number})
       </li>`);

    $episodesList.append($episode);

  }
  $episodesArea.show();
}


/** Handle episode display button: get episodes from API and display.
 *    Show episodes area
 */

async function showEpisodes(evt: JQuery.ClickEvent) {

  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  console.log('eps', episodes);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", showEpisodes);
