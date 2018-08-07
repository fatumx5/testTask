var mapTool = {
    myMap: {},
    group: {}
  },
  DOM_tool = {
    JSON_Search: [],
    form: document.forms[0],
    content: [],
    responseCount: []
  };

window.onload = init();

(function() {
  var time;
  window.onresize = function(e) {
    if (time)
      clearTimeout(time);
    time = setTimeout(function() {
      SetSize(window.innerWidth, window.innerHeight);
    }, 0);
  }
})();

DOM_tool.form.addEventListener('submit', async function(e) {
  var searchLine = DOM_tool.form.elements.findLine.value;
  e.preventDefault();
  if (DOM_tool.form.elements.findLine.value != "") {
    showSearchResults(searchLine);
  };
});

function showSearchResults(searchLine) {
  HTML_str = ''
  Search(searchLine).then(addNew => {
    DOM_tool.responseCount.push(DOM_tool.JSON_Search.length)
    DOM_tool.content.push(searchLine);

    for (i = 0; i < DOM_tool.content.length; i++) {
      HTML_str = HTML_str +
        '<div class = "search-item" onclick="runSearchBy_DivClick(this.innerHTML)"><p class ="recent-text">' +
        DOM_tool.content[i] +
        '</p>' + '<p class="count">' +
        DOM_tool.responseCount[i] +
        '</p></div>';
    }
    document.getElementById('recent').innerHTML = HTML_str;
    document.getElementsByClassName('search-item')[DOM_tool.content.length - 1].style.backgroundColor = 'rgb(210, 100, 60)';
  });
  DOM_tool.form.elements.findLine.value = "";
}

//-------UpdateMarkerState-------
async function UpdateMarkerState(data) {
  mapTool.group.clearLayers();
  if (data[0] != null) {
    let minX = DG.marker([data[0].lat, data[0].lon]).options.icon.options.iconSize[0];
    let minY = DG.marker([data[0].lat, data[0].lon]).options.icon.options.iconSize[1];

    for (j = 0; j < data.length; j++) {
      let current = DG.marker([data[j].lat, data[j].lon]).getLatLng();
      let X1 = mapTool.myMap.latLngToContainerPoint(current).x;
      let Y1 = mapTool.myMap.latLngToContainerPoint(current).y;

      if ((X1 > 100 && X1 < window.innerWidth - 100) && (Y1 > 100 && Y1 < window.innerHeight - 100)) {
        isShowable = true;
        isEmpty = false;
        for (i = 0; i < data.length; i++) {
          if (j != i) {
            let checking = DG.marker([data[i].lat, data[i].lon]).getLatLng();
            let X2 = mapTool.myMap.latLngToContainerPoint(checking).x;
            let Y2 = mapTool.myMap.latLngToContainerPoint(checking).y;

            if (!(Math.abs(X1 - X2) > minX || Math.abs(Y1 - Y2) > minY)) {
              if (i > j) {
                isEmpty = true;
              } else {
                isShowable = false;
              }
              break;

            };
          };
        };
        if (isShowable || isEmpty) {
          mapTool.group.addLayer(DG.marker([data[j].lat, data[j].lon]));
          mapTool.group.addTo(mapTool.myMap)

        };
      };
    };
  };
};

//-------SetSize-------
async function SetSize(width, height) {
  var mapArea = document.getElementById("map");
  mapArea.style.height = height + "px";
  mapArea.style.width = width + "px";
};

function runSearchBy_DivClick(line) {
  searchLine = line.replace(/<p class="recent-text">/, "").replace(/<\/p><p class="count">\d*<\/p>/, "");
  showSearchResults(searchLine);

}
async function Search(searchLine) {
  searchURL = 'http://catalog.api.2gis.ru/2.0/catalog/marker/search?q=' + searchLine + '&page_size=1000&region_id=32&key=ruhebf8058'
  await axios.get(searchURL).then(response => {
    DG.then(function() {
      if (response.data.result != null) {
        DOM_tool.JSON_Search = response.data.result.items;
      } else {
        DOM_tool.JSON_Search = [];
      };

      UpdateMarkerState(DOM_tool.JSON_Search);
    });
  });
};


async function init() {
  SetSize(window.innerWidth, window.innerHeight);

  DG.then((function() {
    mapTool.myMap = DG.map('map', {
      center: [55.749, 37.59],
      zoom: 13
    });
    mapTool.group = DG.featureGroup();

    mapTool.myMap.on('moveend', function(e) {
      UpdateMarkerState(DOM_tool.JSON_Search);
    });
  }));
};