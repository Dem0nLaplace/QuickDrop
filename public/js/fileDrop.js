       /*added 11/6/2024, code for file drag and drop*/
       const dropArea = document.getElementById('dropArea');
       const overlay = document.getElementById('overlay'); // Reference the overlay directly from the DOM
       const newFileInput = document.getElementById('newFileInput');
       let dragCounter = 0; // Counter to track drag events

       // Prevent default drag behaviors for the entire document
       ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
           document.addEventListener(eventName, (e) => e.preventDefault());
       });

       // Show overlay when dragging a file over the document
       document.addEventListener('dragenter', (e) => {
           e.preventDefault();
           dragCounter++;
           overlay.style.display = 'block';
       });

       // Hide overlay when dragging leaves or a file is dropped
       document.addEventListener('dragleave', (e) => {
           e.preventDefault();
           dragCounter--;
           if (dragCounter === 0) {
               overlay.style.display = 'none';
           }
       });

       // Handle drop event and process files
       document.addEventListener('drop', (e) => {
           e.preventDefault();
           overlay.style.display = 'none';
           dragCounter = 0; // Reset counter
           const files = e.dataTransfer.files;
           handleFiles(files);
       });

       // Handle click to open file input dialog
       dropArea.addEventListener('click', () => {
           newFileInput.click();
       });

       // Handle files selected through the file input
       newFileInput.addEventListener('change', (e) => {
           const files = e.target.files;
           handleFiles(files);
       });

       // Function to handle the files and display file info
       //DEBUG, WORK IN PROGRESS
       function handleFiles(files) {
           Array.from(files).forEach(file => {
               const fileInfo = document.createElement('p');
               fileInfo.textContent = `File: ${file.name} - Size: ${(file.size / 1024).toFixed(2)} KB`;
               dropArea.appendChild(fileInfo);
           });
       }
