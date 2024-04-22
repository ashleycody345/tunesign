
// Export endpoints

// Get the modal and button elements
var modal = document.getElementById('popup');
var exportBtn = document.getElementById('exportBtn');
var closeBtn = document.getElementById('closeBtn');
var copyBtn = document.getElementById('copyBtn');
var downloadBtn = document.getElementById('downloadBtn');
var imageLink = document.getElementById('imageLink');

// When the user clicks the Export button, open the modal
exportBtn.onclick = function() {
  modal.style.display = 'block';
}

// Preview
function showImagePreview() {
  var imageLink = imageLink.value;
  var imagePreview = document.getElementById('imagePreview');
  imagePreview.innerHTML = ''; // Clear previous content
  var img = document.createElement('img');
  img.src = imageLink;
  img.alt = 'Image Preview';
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  imagePreview.appendChild(img);
}

// When the user clicks on copy link, it copies it to their clipboard
copyBtn.onclick = function(){
  // navigator.clipboard.writeText('');
  var imagePath = publicZodiacImagePath; // Get the public zodiac image path from the template
    navigator.clipboard.writeText(imagePath)
        .then(function() {
            alert("Link copied to clipboard: " + imagePath);
        })
        .catch(function(error) {
            console.error('Failed to copy: ', error);
        });
  // we could do this however we would have to do a zodaic partial just like how we did it in Web services with the images of each event.
}

// When the user clicks on download, it downloads the image to their desktop
downloadBtn.onclick = function() {
  var a = document.createElement('a');
  a.href = document.getElementById("zodiacImage").src;
  a.download = "zodiac.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// When the user clicks on the close button, close the modal
closeBtn.onclick = function() {
  modal.style.display = 'none';
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

