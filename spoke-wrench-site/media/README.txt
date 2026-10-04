Drop your real video files here, e.g.:
  shop-tour.mp4
  team-intro.mp4

Then replace the .video-placeholder <div> in index.html / about.html with:

  <video controls poster="media/your-poster.jpg">
    <source src="media/shop-tour.mp4" type="video/mp4">
    Your browser doesn't support embedded video.
  </video>

Photos: this project currently uses hand-drawn SVG illustrations instead of
real photos (see css/style.css .gallery-grid). To use real photos instead,
drop .jpg/.png files in this folder and swap the <svg> blocks in the
.gallery-grid figures for <img src="media/your-photo.jpg" alt="..."> tags.
