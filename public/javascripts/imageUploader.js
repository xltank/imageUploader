/**
 * Created by Administrator on 2014/12/30.
 */


/**
 * @el required.
 * @imageUrl image placeholder.
 */
function ImageUploader(el, imgUrl, fileSelectedHandler, uploadedHandler, clearImageHandler, previewImageHandler,data){

    var self = this;
    var rand = parseInt(Math.random()*9999);

    this.enable = true;
    this.setEnable = function(boo){
        this.enable = boo;
        if(node)
            node.style.cursor = boo ? 'pointer' : 'auto';
        if(removeButton)
            removeButton.style.display = boo ? 'auto' : 'none';
        if(previewButton)
            previewButton.style.display = boo ? 'auto' : 'none';
    }

    this.setImageUrl = function(url){
        if(!url || !image) return;

        if(url.indexOf('http://') != 0)
            image.src = 'http://'+url;
        else
            image.src = url;
    }

    var nodeHTML =
            '<div style="width: {width}; height: {height}; position: absolute; cursor: pointer;">'+
            '<input id="fileInput_'+rand+'" type="file" style="display: none;" accept="image/png, image/jpeg, image/jpg">'+
            '<img id="image_'+rand+'" class="snapshotImage" style="width: {width}; height: {height}; position: absolute; left: 0; top: 0;border-radius: 5px;"'+
            'src="">'+
            '<span id="removeButton_'+rand+'" class="glyphicon glyphicon-remove" ' +
            'style="position: absolute; right: 0; font-size:14px ;  cursor: pointer; background-color: rgba(224,224,224,0.5); color: #aa5555; top:0;"></span>'+
            '<span id="previewButton_'+rand+'" class="glyphicon glyphicon-search" ' +
            'style="position: absolute; right: 16px; font-size:14px ;  cursor: pointer; background-color: rgba(224,224,224,0.5); color: #aa5555; top:0;"></span>'+
            '</div>';

    function browseFile(){
        if(!self.enable) return;

        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        document.getElementById("fileInput_"+rand).dispatchEvent(evt);

        /*var p = 0;
         var i = setInterval(function(){
         drawProgress(p+=1/100);
         if(p>1)
         clearInterval(i);
         }, 50);*/
    }

    function fileSelected(){
        image.src = window.URL.createObjectURL(arguments[0].currentTarget.files[0]);
        initCanvas();
        if(fileSelectedHandler)
            fileSelectedHandler(self, document.getElementById("fileInput_"+rand).files[0], data);
    }

    this.upload = function(url){
        var formData = new FormData();
        formData.append("file", document.getElementById("fileInput_"+rand).files[0]);
        var request = new XMLHttpRequest();
        request.onreadystatechange = requestStateChanged;
        request.upload.addEventListener("progress", uploadProgress);
        request.open("post", url, true);
        request.send(formData);
    }

    var curCanvas;
    function initCanvas(){
        curCanvas = document.createElement('canvas');
        curCanvas.width = realW;
        curCanvas.height = realH;
//        curCanvas.style="z-index:20; position: absolute; left:15px; top:0;";
        curCanvas.style.zIndex = 20;
        curCanvas.style.position = 'absolute';
        curCanvas.style.left = 0;
        curCanvas.style.top = 0;
        image.parentNode.appendChild(curCanvas);
    }

    function requestStateChanged(){
//        console.log(this.readyState, this.status);
        if(this.readyState == 4){
            if(this.status == 200){
                if(uploadedHandler)
                    uploadedHandler(self, this, data);
            }else{
                if(this.response.indexOf('errorMessage') != -1){
                    showMessageDialog("Errors uploading image: "+ JSON.parse(this.response).errorMessage, 0);
                }
            }
            removeCanvas();
        }
    }

    function removeCanvas(){
        if(curCanvas.parentNode)
            curCanvas.parentNode.removeChild(curCanvas);
    }

    function uploadProgress(e){
        if(e.lengthComputable){
            var percent = parseInt(e.loaded / e.total * 100) / 100;
//            console.log(e.loaded, e.total, percent);
            drawProgress(percent);
        }
    }

    function drawProgress(p){
        if(p < 0 || !curCanvas)
            return;

        var g = curCanvas.getContext('2d');
        g.clearRect(0, 0, realW, realH);
        g.fillStyle = '#ff0000';
        g.moveTo(realW/2, realH/2);
        g.arc(realW/2, realH/2, 2*Math.max(realW, realH), 0, p*2*Math.PI);
        g.lineTo(realW/2, realH/2);
        var c = parseInt(255*p);
        g.fillStyle = "rgba(55, "+c+", 55, 0.7)";
//        console.log(g.fillStyle);
        g.fill();

//        if(p>=1)
//            curCanvas.parentNode.removeChild(curCanvas);
    }

    function clearImage(){
        if(!self.enable) return;

        image.src = '';
        if(clearImageHandler)
            clearImageHandler(self, image, data);
    }

    function preview(){
        if(!self.enable) return;

        if(previewImageHandler)
            previewImageHandler(self, image, data);
    }

    var node;
    var image;
    var fileInput;
    var removeButton;
    var realW;
    var realH;
    var previewButton;

    this.init = function(){
        var container = document.getElementById(el);
        if(!container){
            console.log("Can not find element "+el);
            return ;
        }

        var cStyle = window.getComputedStyle(container);
        realW = parseInt(cStyle.width)-parseInt(cStyle.paddingLeft)-parseInt(cStyle.paddingRight);
        realH = parseInt(cStyle.height)-parseInt(cStyle.paddingTop)-parseInt(cStyle.paddingBottom);
        nodeHTML = nodeHTML.replace(/\{width\}/g, realW+'px').replace(/\{height\}/g, realH+'px');
        if(imgUrl){
            nodeHTML = nodeHTML.replace('{imgUrl}', imgUrl);
        }
        document.getElementById(el).innerHTML = nodeHTML;

        node = container.getElementsByTagName('div')[0];
        image = document.getElementById('image_'+rand);
        image.addEventListener('click', browseFile);
        fileInput = document.getElementById('fileInput_'+rand);
        fileInput.addEventListener('change', fileSelected);
        removeButton = document.getElementById('removeButton_'+rand);
        removeButton.addEventListener('click', clearImage);
        previewButton = document.getElementById('previewButton_'+rand);
        if(previewImageHandler){
            previewButton.addEventListener('click',preview);
        }else{
            previewButton.style.display = 'none';
        }
    }

    this.init();
}