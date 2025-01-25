
/*   
    download/upload complete icon: <i class="fas fa-check-circle file-status complete"></i> 
    downloading/uploading icon:    <i class="fas fa-times-circle file-status downloading"></i>
*/  

    let fileProgressIDCounter = 1;
    class fileProgress{
        constructor(filename, fileType, fileSize){
            this.filename = filename;
            this.fileType = fileType;
            this.fileSize = fileSize;
            this.fileProgressID = "fileProgress" + fileProgressIDCounter;
            this.downloadSize = 0
            this.intervalID = undefined;

            fileProgressIDCounter++;
        }
    }

    //access point of this file
    //creates and appends a DOM element "fileProgress" to the container "fileList"
    //also sets up the interval to update the DOM element, and the event listener to remove it
    function addFileProgress(fileProgress, peerUserIcon, peerUsername){
        const container = document.getElementById("fileList");
        container.appendChild(
            makeFile(
                fileProgress.fileProgressID, 
                fileProgress.filename, 
                peerUserIcon, 
                peerUsername, 
                fileProgress.fileType, 
                fileProgress.downloadSize, 
                fileProgress.fileSize,
                fileProgress.intervalID
            )
        );

        fileProgress.intervalID = setInterval(()=>
            updateFileProgress(
                fileProgress.fileProgressID, 
                fileProgress.downloadSize, 
                fileProgress.fileSize, 
                fileProgress.intervalID
            ), 1000
        );    //set interval for update

        //add remove icon event listener
        const removeIcon = document.getElementById(fileProgress.fileProgressID).querySelector('.file-status.downloading');
        removeIcon.addEventListener('click', () => removeFileProgress(fileProgress.fileProgressID, fileProgress.intervalID));
    }

    //make a DOM element "fileProgress" with the arguments given
    function makeFile(fileProgressID, filename, peerUserIcon, peerUsername, fileType, downloadSize, fileSize) {
        // Create the HTML as a string using template literals
        const fileHTML = `
            <!-- <div class="file"> -->
                <img src=${peerUserIcon} title=${peerUsername}></img>
                <div class="file-icon" data-type="${fileType}"></div>
                <div class="text-and-progress">
                    <div class="file-name">${filename}</div>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: 90%" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <div class="file-size-and-percentage">
                    <span class="file-size">${downloadSize} / ${fileSize}</span>
                    <span class="file-percentage">0%</span>
                    </div>
                </div>
                <i class="fas fa-times-circle file-status downloading"></i>
            <!-- </div> -->
            `;

        // Convert the HTML string to a DOM element
        const template = document.createElement('div');
        template.id = fileProgressID;
        template.classList.add("file");
        template.innerHTML = fileHTML;
        
        return template;
    }

    //remove the DOM element "fileProgress" and the associated interval with the given fileProgressID and intervalID
    function removeFileProgress(fileProgressID, intervalID){
        let item = document.getElementById(fileProgressID);
        clearInterval(intervalID);
        if(item){
            item.remove();
            console.log(`Removed file progress with id ${fileProgressID}`);
        }else{
            console.error(`No File Progress with ID ${fileProgressID} found!`);
        }
    }

    //update the DOM element "fileProgress"
    //call with setInterval
    //DO NOT call this function externally, this function is supposed to call only within addFileProgress()
    function updateFileProgress(fileProgressID, downloadSize, fileSize, intervalID) {
        console.log("DEBUG: download size  = " + downloadSize);
        //if the DOM element with fileProgressID exists
        if(!document.getElementById(fileProgressID)){
            clearInterval(intervalID);
            console.warn(`updateFIleProgress: DOM element with ${fileProgressID} not found, terminating interval`);
            return;
        }

        document.getElementById(fileProgressID).getElementsByClassName("file-size")[0].innerHTML = unitConversion(downloadSize) + " / " + unitConversion(fileSize);
        var percentage = ((downloadSize / fileSize) * 100).toFixed(1);
        
        //check > 100%
        if (percentage > 100) {
            console.error("Percentage > 100, Check Download Size and File Integrity !!");
            percentage = 100;
        }

        document.getElementById(fileProgressID).getElementsByClassName("progress-bar")[0].style.width = percentage + "%";
        document.getElementById(fileProgressID).getElementsByClassName("file-percentage")[0].innerHTML = percentage + "%";

        //check download complete
        if (downloadSize >= fileSize) {
            //remove downloading icon
            document.getElementById(fileProgressID).getElementsByClassName("fas fa-times-circle file-status downloading")[0].remove();

            //add download complete icon
            var downloadCompleteIcon = `<i class="fas fa-check-circle file-status complete"></i>`;
            document.getElementById(fileProgressID).innerHTML += downloadCompleteIcon;

            clearInterval(intervalID);
        }
    }

    //pass in bytes(int), converts to KB, MB, GB (string)
    function unitConversion(size) {
        let sizeUnit = 0;
        let sizeUnitArray = ["byte", "KB", "MB", "GB"];
        for (let i = 0; i < 4; i++) {
            if (size >= 1024) {
                size /= 1024;
                sizeUnit++;
            }
        }

        return size.toFixed(2) + sizeUnitArray[sizeUnit];
    }