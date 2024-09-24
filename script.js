$(document).ready(async function() {
    window.timelineOptions = {
        type: "point",
        startDatetime: "1910",
        endDatetime: "2023",
        scale: "year",
        rows: 74,
        minGridSize: 17.5,
        rowHeight: 35,
        rangeAlign: "right",
        loadingMessage: "Loading...",
        headline: {
            display: false
        },
        ruler: {
            top: {
                lines: ["year"],
                color: "transparent",
                fontSize: 13,
                format: {
                    year: "number"
                }
            },
            bottom: {
                lines: ["year"],
                color: "transparent",
                fontSize: 13,
                format: {
                    year: "number"
                }
            }
        },
        effects: {
            horizontalGridStyle: "none",
            stripedGridRow: false
        },
        colorScheme: {
            theme: {
                gridbase: "gainsboro"
            }
        }
    }
    const ichimonColor = {
        Dewanoumi: "#f2aaaa",	//pink
        Takasago: "#d8bd82",	//sand-orange
        Nishonoseki: "#a3ce52",	//lime-green
        Isegahama: "#66ccb3",	//cyan
        Tokitsukaze: "#d399f0",	//purple
        Takanohana: "#44ab4d"	//dark green
    },
    grayHex = "#8c8c8c",
    rankAbbr = {
        'Y': "yokozuna",
        'O': "ozeki",
        'S': "sekiwake",
        'K': "komusubi",
        'M': "maegashira",
        'J': "juryo",
        "Ms": "makushita",
        "Sd": "sandanme",
        "Unknown": "rikishi"
    },
    dbHeyaId = {
        Ajigawa: 1, Araiso: 2, Arashio: 3, Asahiyama: 4, Asakayama: 5, Azumazeki: 6, Chiganoura: 7, Dekiyama: 8, Dewanoumi: 9, Edagawa: 10, Fujigane: 11, Fujishima: 12, Furiwake: 13, Futabayama: 109, Futagoyama: 14, Hakkaku: 15, Hanakago: 17, Hanaregoma: 18, Hatachiyama: 19, Hidenoyama: 20, Ikazuchi: 21, Irumagawa: 23, Isegahama: 24, Isenoumi: 25, Izutsu: 27, Jinmaku: 28, Kabutoyama: 29, Kagamiyama: 30, Kashiwado: 130, Kasugano: 31, Kasugayama: 32, Kataonami: 33, Kimigahama: 35, Kiriyama: 36, Kise: 37, Kitanoumi: 107, Kokonoe: 40, Kumagatani: 41, Kumegawa: 42, Magaki: 43, Matsuchiyama: 44, Matsugane: 45, Michinoku: 46, Mihogaseki: 47, Minato: 48, Minatogawa: 49, Minezaki: 50, Miyagino: 51, Musashigawa: 52, Nakadachi: 53, Nakagawa: 54, Nakamura: 55, Naruto: 56, Nishiiwa: 57, Nishikido: 58, Nishikijima: 59, Nishonoseki: 60, Oguruma: 61, Oitekaze: 62, Onaruto: 63, Onoe: 64, Onogawa: 65, Onomatsu: 66, Oshima: 67, Oshiogawa: 68, Otake: 69, Otowayama: 70, Oyama: 71, Sadogatake: 72, Sakaigawa: 73, Sanoyama: 74, Shibatayama: 77, Shikihide: 78, Shikoroyama: 79, Shiratama: 81, Tagonoura: 82, Taiho: 106, Takadagawa: 83, Takanohana: 108, Takasago: 84, Takashima: 86, Takekuma: 87, Tamagaki: 89, Tamanoi: 90, Tanigawa: 91, Tatekawa: 92, Tateyama: 93, Tatsunami: 94, Tatsutagawa: 95, Tatsutayama: 96, Tokitsukaze: 97, Tokiwayama: 98, Tomozuna: 99, Urakaze: 100, Wakafuji: 101, Wakamatsu: 102, Yamahibiki: 103, Yamashina: 104, Yamawake: 105, Yoshibayama: 11
    },
    shikonaInUrl = [
        { "3649": "Kiyomigata" },
        { "3574": "Irumagawa" },
    ],
    picException = [
        5949,
        4624,
        3465,
        3516,
        4932,
        3522,
        3526,
        3490,
        3504,
    ];
    const response1 = await fetch("heya_data/all_heya.json");
    var heya = await response1.json();
    const response2 = await fetch("heya_data/heya_data.csv");
    var csv = await response2.text();

    function addEventToTimeline(eventObject) {
        $(".timeline-events").first().append('<div data-timeline-node="' + JSON.stringify(eventObject).replace(/"/g, "'") + '"></div>');
    }

    heya = _.chain(heya)
        .sortBy(function(h) {
            return h.events[0].date;
        })
        .groupBy("row")
        .values()
        .flatten(1)
        .value();

    for (var i = 0; i < heya.length; i++) {
        if (!heya[i].hasOwnProperty("row")) continue;
        
        var color = grayHex;
        
        for (var j = 0; j < heya[i].events.length; j++) {
            var eventId = heya[i].id * 100 + j;
            var eventObj = {
                row: heya[i].row,
                id: eventId,
                relation: {},
                size: 14,
                extend: {
                    toggle: "popover",
                    title: ' '
                }
            };
            var event = heya[i].events[j].event.split('/');
            var dates = heya[i].events[j].date.split('-');
            var nameTags = [];

            if (event[0] == "HS")
                eventObj.start = dates.shift();
            else
                eventObj.start = dates.pop();
            if (j < heya[i].events.length - 1) 
                eventObj.relation.after = eventId + 1;
            else if (heya[i].active)
                eventObj.relation.after = -1;
            if (heya[i].events[j].hasOwnProperty("ichimon")) {
                if (ichimonColor.hasOwnProperty(heya[i].events[j].ichimon))
                    color = ichimonColor[heya[i].events[j].ichimon];
                else color = grayHex;
            }
            eventObj.bgColor = color;
            eventObj.bdColor = color;
            eventObj.relation.linecolor = color;
            eventObj.relation.linestyle = "normal";
            eventObj.relation.linesize = 3;
            if (heya[i].events[j].hasOwnProperty("heyaName")) nameTags.push('h');
            if (heya[i].events[j].hasOwnProperty("shisho")) nameTags.push('s');
            if (nameTags.length > 0)
                eventObj.extend.tags = nameTags.join('/');
            else if (heya[i].events[j].event == "HS" && j < heya[i].events.length - 1 && 
                heya[i].events[j].reason == "decease"
                )
                eventObj.extend.tags = "end-s";
            for (var k = 0; k < event.length; k++) {
                switch (event[k]) {
                    case "CK": eventObj.image = "imgs/arrow.svg"; break;
                    case "HI": eventObj.image = "imgs/cirrow.svg"; break;
                    case "JA":
                        eventObj.extend.shape = "square";
                        eventObj.image = "imgs/squareframe.svg"; 
                        break;
                    case "CI":
                        if (event.length < 2) eventObj.extend.invis = ""; 
                        break;
                    case "HB":
                    case "HBa":
                    case "DB":
                    case "HF":
                    case "HE":
                    case "HU":
                        eventObj.extend.shape = "square";
                        if (dates.length > 0 || event[k] == "HE" || event[k] == "HU") eventObj.extend.transparent = "";
                        else if (heya[i].events[j].hasOwnProperty("relation") && j == 0) {
                            var parentHeya = heya.find(h => h.id == parseInt(heya[i].events[j].relation[0].split('-')[1]));
                            var branchEventObj = {
                                id: parseInt("99" + eventId),
                                start: eventObj.start,
                                row: parentHeya.row,
                                relation: {
                                    after: eventId,
                                    linecolor: color,
                                    linestyle: "normal",
                                    linesize: 3
                                },
                                extend: {
                                    invis: ""
                                }
                            };

                            addEventToTimeline(branchEventObj);
                            eventObj.extend.hasline = "";
                        }
                        else if (event[k] == "HBa")
                            eventObj.size = 13;
                        break;
                    case "HS":
                        eventObj.extend.shape = "square";
                        if (dates.length == 0)
                            eventObj.image = "imgs/xmark.svg";
                        else eventObj.extend.transparent = "";
                        if (heya[i].events[j].hasOwnProperty("relation") && 
                            j == heya[i].events.length - 1 && heya[i].events[j].relation.length == 1
                            ) {
                            for (var k = 0; k < heya[i].events[j].relation.length; k++) {
                                var mergingHeya = heya.find(h => h.id == parseInt(heya[i].events[j].relation[k].split('-')[1]));
                                var mergeEventObj = {
                                    id: parseInt("99" + k + eventId),
                                    start: eventObj.start,
                                    row: mergingHeya.row,
                                    relation: {
                                        after: eventId,
                                        linecolor: color,	//"80" = 50%, "ab" = 67%, "bf" = 75%,
                                        linestyle: "dotted",
                                        linesize: 2
                                    },
                                    extend: {
                                        invis: ""
                                    }
                                };
                                if (mergingHeya.row > heya[i].row)
                                    eventObj.image = "imgs/xmark-linelow.svg";
                                else eventObj.image = "imgs/xmark-linehigh.svg";

                                addEventToTimeline(mergeEventObj);
                            }
                            
                            eventObj.extend.hasline = "";
                        }
                        else if (j < heya[i].events.length - 1) {
                            eventObj.size = 13;
                            eventObj.relation.linecolor += "ab";
                        }
                        break;
                    default: break;
                }
            }
            addEventToTimeline(eventObj);
        }
    }
    $("#heyaTimeline").Timeline(window.timelineOptions);

    $("#heyaTimeline").Timeline("initialized", () => {
        const chart = Highcharts.chart("graphContainer", {
            chart: {
                type: "line",
                zooming: {
                    type: 'x',
                    mouseWheel: false
                },
                panning: {
                    enabled: true
                }
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        align: "left",
                        format: "<b>{point.newName}</b><br>{point.shisho}",
                        style: {
                            fontWeight: "normal"
                        }
                    },
                    cursor: "pointer",
                    point: {
                        events: {
                            click: function() {
                                if (chart.options.chart.type == "spline") return;
                                var d = new Date(this.x),
                                    url = "https://sumodb.sumogames.de/Banzuke.aspx?b=";

                                url += d.getFullYear();
                                if (d.getMonth() + 1 < 10) url += '0';
                                url += (d.getMonth() + 1) + "&heya=" + dbHeyaId[this.heyaName];
                                window.open(url, "_blank").focus();
                            }
                        }
                    },
                    dataGrouping: {
                        enabled: false,
                        approximation: "average",
                        forced: true,
                        anchor: "middle",
                        units: [
                            ["year", [2]]
                        ]
                    },
                    marker: {
                        enabled: false,
                        lineColor: "white",
                        lineWidth: 1,
                        symbol: "circle",
                        radius: 5
                    },
                    label: {
                        enabled: true,
                        format: "{options.custom.heyaLabel}"
                    }
                },
            },
            colors: [
                "#32937c", "#d648a2", "#54cd5f", "#a562dc", "#88d24c", "#4071f3", "#b1c639", "#786de5", "#d9bf3c", "#4372de", "#eaa733", "#658df0", "#4a992f", "#d96dd7", "#4bdb8c", "#dc4271", "#67d499", "#dd4847", "#57d6cd", "#e3572f", "#4fc2e4", "#e57e26", "#4a71ca", "#96ca67", "#8670cf", "#738f2e", "#9f5aaf", "#389b5b", "#bb87da", "#9d8b26", "#6c78c2", "#c58a2d", "#4a92ce", "#c56432", "#a8aaeb", "#c2c66d", "#7b77b1", "#ec975c", "#71caa5", "#e67d9f", "#5d884e", "#e59ed8", "#9ec485", "#ae6090", "#e0b975", "#c26060", "#8d8443", "#e99380", "#a56f2c", "#ad744e"
            ],
            xAxis: {
                ordinal: false,
                type: "datetime"
            },
            yAxis: {
                min: 0,
                allowDecimals: false
            },
            legend: {
                enabled: false
            },
            title: {
                text: "Number of rikishi in heya"
            },
            subtitle: {
                text: "Source: Sumo Reference"
            },
            tooltip: {
                shared: true,
                split: false,
                headerFormat: '<span style="font-size: 10px">{point.key}</span>',
                pointFormat: '<br><span style="color: {series.color}">●</span> {point.heyaName}: <b>{point.y}</b>'
            },
            series: []
        });

        setData();
        
        function setData() {
            const start = 2, active = 44;
            var csvLines = csv.split(/[\r?\n|\r|\n]+/);
            var names = csvLines[0].split(',');

            names = names.slice(start);
            for (var i = 0; i < names.length; i++) {
                chart.addSeries({
                    name: names[i].split('-')[0],
                    data: []
                });
                chart.series[i].hide();
                if (i == active) {
                    $("<div>", {
                        class: "divider"
                    }).appendTo("#legends");
                }
                $("<li>", {
                    html: "<a>" + names[i].split('-')[0] + "</a>",
                    class: names[i] + " lineThru",
                    css: {
                        color: chart.series[i].color
                    },
                    mouseenter: function() {
                        if (this.classList.contains("lineThru")) return;

                        var seriesInd = $("#legends > li").index(this);

                        chart.series[seriesInd].setState("hover");
                        for (var i = 0; i < chart.series.length; i++) {
                            if (chart.series[i].visible && i != seriesInd)
                                chart.series[i].setState("inactive");
                        }
                    },
                    mouseleave: function() {
                        if (this.classList.contains("lineThru")) return;

                        for (var i = 0; i < chart.series.length; i++)
                            chart.series[i].setState("normal");
                    },
                    click: function() {
                        var seriesInd = $("#legends > li").index(this);
                        var theSeries = chart.series[seriesInd];

                        chart.showLoading("Please wait...");
                        this.classList.toggle("lineThru");
                        setTimeout(function() {
                            if (theSeries.options.data.length == 0) {
                                for (var i = 1; i < csvLines.length; i++) {
                                    var rowData, cellData, dateStr, dateObj, attrib, point = {};
                    
                                    if (csvLines[i].length == 0) continue;
                                    rowData = csvLines[i].split(',');
                                    cellData = rowData[seriesInd + start];
                                    if (cellData.length == 0) continue;
                                    dateStr = rowData[0].split('-');
                                    dateObj = Date.UTC(parseInt(dateStr[0]), parseInt(dateStr[1]) - 1);
                                    if (cellData == 'n') {
                                        point = {
                                            x: dateObj,
                                            y: null
                                        }
                                        theSeries.addPoint(point, false);
                                        continue;
                                    }
                                    attrib = cellData.split('-');
                                    point.x = dateObj;
                                    point.y = parseInt(attrib[0]);
                                    if (attrib.length > 2 && dateStr.join('-') != "1935-01") {
                                        point.marker = { enabled: true };
                                        if (attrib.length > 3)
                                            point.marker.symbol = "square";
                                        else if (attrib.at(-1).includes(' '))
                                            point.marker.symbol = "circle";
                                        else
                                            point.marker.symbol = "triangle";
                                    }
                                    if (attrib.at(-1).includes(' '))
                                        point.shisho = attrib.pop();
                                    if (attrib.length > 2) {
                                        if (theSeries.name == attrib.at(-1) && theSeries.options.data.length == 0) {
                                            theSeries.options.custom = {
                                                heyaLabel: attrib.at(-1)
                                            }
                                        }
                                        names[seriesInd] = attrib.pop();
                                        point.newName = names[seriesInd];
                                    }
                                    point.heyaName = names[seriesInd];
                                    theSeries.addPoint(point, false);
                                }
                                theSeries.show();
                            }
                            else if (!theSeries.visible)
                                theSeries.show();
                            else
                                theSeries.hide();
    
                            var visibleCount = 0, overlap;
                            
                            for (var i = 0; i < chart.series.length; i++)
                                if (chart.series[i].visible) visibleCount++;
                            if (visibleCount > 1) overlap = false;
                            else if (visibleCount == 1) overlap = true;
                            if (typeof overlap != "undefined") {
                                chart.update({
                                    plotOptions: {
                                        line: {
                                            dataLabels: {
                                                allowOverlap: overlap
                                            }
                                        }
                                    }
                                });
                            }
                            chart.hideLoading();
                        }, 200);
                    }
                }).appendTo("#legends");
            }
        }
        $("#hideAll").on("click", function() {
            var legendItems = $("#legends > li");

            chart.showLoading("Please wait...");
            setTimeout(function() {
                for (var i = 0; i < legendItems.length; i++) {
                    if (!legendItems[i].classList.contains("lineThru")) {
                        chart.series[i].hide();
                        legendItems[i].classList.add("lineThru");
                    }
                }
                chart.hideLoading();
            }, 200);
        });
        $("#averageCheck").on("click", function() {
            if (this.checked) {
                chart.update({
                    chart: {
                        type: "spline"
                    },
                    tooltip: {
                        valueDecimals: 1
                    },
                    plotOptions: {
                        series: {
                            dataGrouping: {
                                enabled: true
                            }
                        }
                    }
                });
            }
            else {
                chart.update({
                    chart: {
                        type: "line"
                    },
                    tooltip: {
                        valueDecimals: 0
                    },
                    plotOptions: {
                        series: {
                            dataGrouping: {
                                enabled: false
                            }
                        }
                    }
                });
            }
        });

        var eventNodes = $(".jqtl-event-node").not("[data-invis]");

        eventNodes.popover({
            placement: "auto",
            fallbackPlacements: ["right", "bottom", "top", "left"],
            trigger: "click focus",
            html: true,
            container: ".jqtl-main",
            animation: true,
            template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
        });

        $(".jqtl-main").on("mousedown", function() {
            $(this).css("cursor", "grabbing");
        });
        $(".jqtl-main").on("mouseup", function() {
            $(this).css("cursor", "");
        });

        removeOverlaps(addTags);
        
        $(".jqtl-container").on("keydown click", function(e) {
            var visiblePopover = $(".popover.show");
            if (visiblePopover.length > 0 && (e.which == 27 || (!e.target.id.startsWith("evt-") && 
                !document.querySelector(".popover").contains(e.target)))) {
                visiblePopover.popover("hide");
                document.activeElement.blur();
            }
        });
        $(".jqtl-container").on("touchstart", function(e) {
            if (!e.target.className.startsWith("e-") && $(".activeTag").length > 0) {
                $(".active").removeClass("active");
                $(".activeTag").removeClass("activeTag");
            }
        });
        eventNodes.on("mouseenter", function() {
            $(".e-" + this.id.slice(4)).addClass("activeTag");
        }).on("mouseleave", function() {
            $(".e-" + this.id.slice(4)).removeClass("activeTag");
        });
        eventNodes.attr("tabindex", '0');

        function removeOverlaps(callback) {
            eventNodes.each(function(index) {
                if (index == eventNodes.length - 1) {
                    setTimeout(callback, 400);
                    return;
                }
                
                var nextNode = eventNodes.eq(index + 1);

                if ($(this).attr("id").slice(0, -2) != nextNode.attr("id").slice(0, -2))
                    return;

                var nextNodeLeft = Math.round(parseFloat(nextNode.css("left")));
                var thisNodeLeft = Math.round(parseFloat($(this).css("left")));
                var thisNodeWidth = parseInt($(this).css("width"));

                if (nextNodeLeft < thisNodeLeft + thisNodeWidth) {
                    var overlapSize = thisNodeLeft + thisNodeWidth - nextNodeLeft;
                    var thisNodeHasLine = typeof $(this).attr("data-hasline") != "undefined";
                    var nextNodeHasLine = typeof nextNode.attr("data-hasline") != "undefined";

                    if ((thisNodeHasLine && nextNodeHasLine) || (!thisNodeHasLine && !nextNodeHasLine)) {
                        $(this).css("left", "-=" + (overlapSize / 2));
                        nextNode.css("left", "+=" + (overlapSize / 2));
                    }
                    else if (thisNodeHasLine)
                        nextNode.css("left", "+=" + overlapSize);
                    else
                        $(this).css("left", "-=" + overlapSize);
                }
                if (thisNodeLeft < 0 && typeof $(this).attr("data-transparent") != "undefined")
                    $(this).css("left", 0);
            });
        }

        function addTags(callback) {
            var nodesWithTag = $($("[data-tags]").not('[data-tags="end-s"]').get().reverse());
            var hTagNodes = $($('[data-tags^="h"]').get().reverse());
            var sTagNodes = $($('[data-tags$="s"]').get().reverse());

            $("<div>", {
                id: "shisho-tags"
            }).appendTo(".jqtl-events");
            $("<div>", {
                id: "heya-tags"
            }).appendTo(".jqtl-events");

            nodesWithTag.each(function(index) {
                var evtId = $(this).attr("id");
                var heyaObj = heya.find(h => h.id == evtId.slice(4, -2));
                var event = heyaObj.events[parseInt(evtId.slice(-2))];
                var initialTop = Math.round(parseFloat($(this).css("top")) + 
                    (parseFloat($(this).css("height")) / 2)) - 15;
                var initialLeft = Math.round(parseFloat($(this).css("left"))) + 15;
                var tags = [];
                
                if ($(this).attr("data-tags").startsWith('h')) tags.push('h');
                if ($(this).attr("data-tags").endsWith('s')) tags.push('s');
                for (let letter of tags) {
                    var tagContainer = $("<div>");
                    var tagEl = $("<span>");
                    var tagRange;
                    var group = (letter == 'h') ? hTagNodes : sTagNodes;
                    var ind = group.index(this);

                    if (ind > 0 && group.eq(ind - 1).attr("id").slice(0, -2) == evtId.slice(0, -2))
                        tagRange = Math.round(parseFloat(group.eq(ind - 1).css("left")) - parseFloat(initialLeft));
                    else if (heyaObj.active)
                        tagRange = Math.round(parseFloat($(".jqtl-bg-grid").css("width")) - parseFloat(initialLeft));
                    else {
                        var hsNode = $("#evt-" + (heyaObj.id * 100 + heyaObj.events.length - 1));
                        tagRange = Math.round(parseFloat(hsNode.css("left")) - parseFloat(initialLeft));
                    }
                    tagRange += 17;
                    if (letter == 'h')
                        initialTop -= 12;
                    else if (tags[0] == 'h')
                        initialTop += 11;
                    tagRange += "px";

                    tagContainer.css({
                        "top": initialTop,
                        "left": initialLeft,
                        "width": tagRange
                    });

                    tagEl.addClass("e-" + evtId.slice(4));
                    tagEl.on("touchstart", function() {
                        if ($(".activeTag").length > 0) {
                            if ($(this).hasClass("activeTag")) {
                                $(".active").removeClass("active");
                                $(".activeTag").removeClass("activeTag");
                                return false;
                            }
                            else {
                                $(".active").removeClass("active");
                                $(".activeTag").removeClass("activeTag");
                            }
                        }
                        $('.' + this.className).addClass("activeTag");
                        $("#evt-" + this.className.split(' ')[0].slice(2)).addClass("active");
                    }).on("mouseenter", function() {
                        $('.' + this.className).addClass("activeTag");
                        $("#evt-" + this.className.split(' ')[0].slice(2)).addClass("active");
                    }).on("mouseleave", function() {
                        $(".active").removeClass("active");
                        $(".activeTag").removeClass("activeTag");
                    });

                    if (letter == 's') {
                        var shishoData = event.shisho.split('-');
                        var shisho = {
                            rank: shishoData[1],
                            shikona: shishoData[2]
                        };
                        var highestRank = "", shikona = "???";

                        if (shisho.rank.split('/').at(-1).length == 0)
                            highestRank = shisho.rank.split('/')[0] + ' ';
                        else if (shisho.rank != "Unknown")
                            highestRank = shisho.rank.split('/').at(-1) + ' ';
                        if (shisho.rank == "Negishi") highestRank = "";
                        if (highestRank.startsWith("OS")) highestRank = "OS ";

                        if (shisho.shikona.split('/').at(-1).length == 0)
                            shikona = shisho.shikona.split('/')[0];
                        else if (shisho.shikona != "Unknown")
                            shikona = shisho.shikona.split('/').at(-1);

                        tagEl.text(highestRank.replace('#', "") + shikona);
                        tagContainer.html(tagEl).prependTo("#shisho-tags");
                        /*
                        var tagBg = tagEl.clone();
                        tagBg.unbind();
                        tagBg.attr("class", "tagBg");
                        tagContainer.clone().html(tagBg).prependTo("#shisho-tags");
                        */
                    }
                    else {
                        tagEl.text(event.heyaName);
                        tagContainer.html(tagEl).prependTo("#heya-tags");
                        /*
                        var tagBg = tagEl.clone();
                        tagBg.unbind();
                        tagBg.attr("class", "tagBg");
                        tagContainer.clone().html(tagBg).prependTo("#heya-tags");
                        */
                    }
                    if (tagContainer.next().length != 0 && tagEl.attr("class").slice(0, -2) == tagContainer.next().children(0).attr("class").slice(0, -2)) {
                        var nextTagLeft = Math.round(parseFloat(tagContainer.next().css("left")));
                        var thisTagLeft = Math.round(parseFloat(tagContainer.css("left")));
                        var thisTagWidth = parseInt(tagEl.css("width"));
                        
                        if (nextTagLeft < thisTagLeft + thisTagWidth + 3) {
                            var overlapSize = thisTagLeft + thisTagWidth - nextTagLeft + 3;

                            tagContainer.next().css("left", "+=" + overlapSize);
                            tagContainer.next().css("width", "-=" + overlapSize);
                        }
                    }
                }
            });
        }
        $(".jqtl-event-node").on("click focus", function(event) {
            var popId = $(this).attr("aria-describedby");
            var visiblePopover = $(".popover.show");
            var focused = false;
            
            $("[aria-describedby]").not(this).popover("hide");
            if (event.type == "click") {
                if (this != document.activeElement)
                    this.focus();
                else {
                    this.blur();
                    $(this).popover("hide");
                    return;
                }
            }
            /*
            $(".pop-close").on("click", () => {
                $(this).popover("hide");
            });
            */
            if ($('#' + popId).hasClass("show")) {
                var heyaId = parseInt($(this).attr("id").slice(4) / 100);
                var eventIndex = $(this).attr("id").slice(4) % 100;
                var heyaEvents = heya.find(h => h.id == heyaId).events;
                var thisEventDetails = heyaEvents[eventIndex];
                var events = thisEventDetails.event.split('/');
                var heyaName = "";
                var shishoInfo = "";
                var popoverBody = "";
                var shishoToshi = null;
                var shishoStatus = null;
                var shishoPicUrl = null;
                var shishoShikona = null;
                const shishoLocalPic = [
                    "Inagawa",
                    "Asashio I",
                    "Ichinishiki",
                    "Dairyu",
                    "Kanechika",
                    "Ozutsu",
                    "Araiwa",
                    "Umegatani I",
                    "Onigatani"
                ];

                for (var i = eventIndex; i >= 0; i--) {
                    if (heyaEvents[i].hasOwnProperty("heyaName")) {
                        if (i == eventIndex && i > 0) continue;
                        heyaName = heyaEvents[i].heyaName;
                        break;
                    }
                }
                if (thisEventDetails.hasOwnProperty("shisho")) {
                    var shishoDetails = thisEventDetails.shisho.split('-');
                    var ranks = shishoDetails[1];
                    var shikona = shishoDetails[2];
                    var sumoDbLink = (typeof shishoDetails[3] != "undefined") ? 
                    "http://sumodb.sumogames.de/Rikishi.aspx?r=" + shishoDetails[3] : 
                    null;

                    if (shishoLocalPic.includes(shikona))
                        shishoPicUrl = "./imgs/";
                    else
                        shishoPicUrl = "http://heyaaz.nagioff.com/image/Kesho/";
                    shishoStatus = shishoDetails[0];
                    switch (shishoStatus) {
                        case "Retired":
                        case "Unknown": break;
                        case "Active": shishoInfo += "Active "; break;
                        case "Negishi": shishoInfo += "Negishi-oyakata"; break;
                        default:
                            shishoInfo += shishoStatus + "-oyakata, ";
                            if (!ranks.startsWith("OS")) shishoInfo += "former ";
                            shishoToshi = shishoStatus;
                    }
                    switch (ranks) {
                        case "Negishi": break;
                        case "Gyoji": shishoInfo += "gyoji " + shikona; break;
                        default:
                            ranks = ranks.split('/');
                            shikona = shikona.split('/');
                            if (shishoStatus == "Retired" && !['Y', 'O'].includes(ranks[0]) || shishoStatus == "Unknown")
                                shishoInfo += "Former ";
                            for (var i = 0; i < ranks.length; i++) {
                                if (ranks[i].length == 0) continue;
                                if (ranks[i].startsWith("OS")) {
                                    shishoInfo += "Osaka-sumo's former ";
                                    ranks[i] = ranks[i].slice(3);
                                }
                                if (ranks[i].includes('#'))
                                    ranks[i] = rankAbbr[ranks[i].split('#')[0]] + '&nbsp;#' + ranks[i].split('#')[1];
                                else ranks[i] = rankAbbr[ranks[i]];
                            }
                            if (sumoDbLink != null)
                                shishoInfo += '<a href="' + sumoDbLink + '" target="_blank">';
                            if (ranks.length > 1) shishoInfo += ranks[1] + ' ';
                            else if (shishoStatus == "Retired" && ["yokozuna", "ozeki"].includes(ranks[0]))
                                shishoInfo += ranks[0].charAt(0).toUpperCase() + ranks[0].slice(1) + ' ';
                            else shishoInfo += ranks[0] + ' ';
                            if (shikona.length > 1) shishoInfo += shikona[1];
                            else shishoInfo += shikona[0];
                            if (sumoDbLink != null) shishoInfo += "</a>";

                            shishoShikona = shikona[0];

                            if (typeof ranks[2] != "undefined" && ranks[2].length > 0) {
                                shishoInfo += " (future " + ranks[2];
                                if (typeof shikona[2] != "undefined") {
                                    shishoInfo += ' ' + shikona[2];
                                    shishoPicUrl += shikona[2].split(' ')[0];
                                    shishoShikona = shikona[2];
                                }
                                else
                                    shishoPicUrl += shikona[0].split(' ')[0];
                                shishoInfo += ')';
                            }
                            else if (typeof ranks[2] != "undefined" && ranks[0].length > 0) {
                                shishoInfo += " (former " + ranks[0];
                                if (typeof shikona[2] != "undefined") {
                                    shishoInfo += ' ' + shikona[0];
                                }
                                shishoPicUrl += shikona[0].split(' ')[0];
                                shishoInfo += ')';
                            }
                            else
                                shishoPicUrl += shikona[0].split(' ')[0];
                            shishoPicUrl += '_' + shishoDetails[3] + ".jpg";
                            break;
                    }
                }
                for (let event of events) {
                    switch (event) {
                        case "JA":
                            popoverBody += " was running the heya when the Osaka Sumo Association dissolved.";
                            break;
                        case "HE":
                            popoverBody += " was running the heya.";
                            break;
                        case "HB":
                        case "HBa":
                        case "HT":
                        case "CK":
                        case "HI":
                        case "HS":
                            var kabu = thisEventDetails.hasOwnProperty("heyaName") ? thisEventDetails.heyaName : heyaName;
                            var clauses = [];
                            
                            if (event != "HS") {
                                if (!thisEventDetails.hasOwnProperty("shisho"))
                                    shishoInfo += heyaName + "-oyakata";
                                if (shishoStatus == "Retired")
                                    clauses.push("retired as rikishi, assumed the kabu <i>" + kabu + "</i>");
                                else if (shishoStatus == "Active")
                                    clauses.push("assumed the kabu <i>" + kabu + "</i>");
                                else if ((heyaName != kabu || shishoToshi != null) && shishoToshi != kabu)
                                    clauses.push("changed his kabu to <i>" + kabu + "</i>");
                                shishoInfo += ' ';
                            }
                            else
                                clauses.push("The heya was closed down");

                            if (event.startsWith("HB"))
                                clauses.push("branched out from " + thisEventDetails.relation[0].split('-')[0] + "-beya");
                            if (event == "HBa")
                                clauses[clauses.length - 1] += ", reviving the heya";
                            else if (["HT", "HI"].includes(event))
                                clauses.push("took over the heya");
                            if (thisEventDetails.hasOwnProperty("reason")) {
                                clauses[clauses.length - 1] += " due to";
                                switch (thisEventDetails.reason) {
                                    case "decease": clauses[clauses.length - 1] += " death"; break;
                                    case "turned 65": clauses[clauses.length - 1] += " retirement"; break;
                                    case "before 65": clauses[clauses.length - 1] += " imminent retirement"; break;
                                    case "health": clauses[clauses.length - 1] += " ill health"; break;
                                    default: clauses[clauses.length - 1] += " dismissal"; break;
                                }
                                clauses[clauses.length - 1] += " of the shisho";
                            }
                            if (["CK", "HI"].includes(event))
                                clauses[clauses.length - 1] += ", thus the heya became " + kabu + "-beya";
                            else if (event == "HS" && thisEventDetails.hasOwnProperty("relation")) {
                                clauses[clauses.length - 1] += ',';
                                clauses.push("its rikishi moved to ");
                                if (thisEventDetails.relation.length > 1) {
                                    for (var i = 0; i < thisEventDetails.relation.length; i++) {
                                        clauses[clauses.length - 1] += thisEventDetails.relation[i].split('-')[0];
                                        if (i < thisEventDetails.relation.length - 2)
                                            clauses[clauses.length - 1] += ", ";
                                        else if (i == thisEventDetails.relation.length - 2)
                                            clauses[clauses.length - 1] += " and ";
                                        else
                                            clauses[clauses.length - 1] += "-beya";
                                    }
                                }
                                else {
                                    clauses[clauses.length - 1] += thisEventDetails.relation[0].split('-')[0];
                                    if (thisEventDetails.relation[0].split('-')[0] == "Futabayama")
                                        clauses[clauses.length - 1] += "-dojo";
                                    else clauses[clauses.length - 1] += "-beya";
                                }
                            }

                            if (clauses.length > 1)
                                popoverBody += clauses.slice(0, -1).join(", ") + " and " + clauses.at(-1);
                            else
                                popoverBody += clauses[0];
                            popoverBody += '.';
                            break;
                        default:
                            break;
                    }
                }
                if (["Futabayama", "Yoshibayama"].includes(heyaName))
                    heyaName += "‑dojo";
                else heyaName += "‑beya";

                $('#' + popId).children(".popover-header").html(thisEventDetails.date);
                if (csv.includes('-' + heyaId + ',')) {
                    var graphButton = $("<span>");

                    graphButton.html(' ' + heyaName + "&nbsp;📈");
                    graphButton.attr("class", "showGraph");
                    graphButton.attr("title", "Click to see rikishi graph");
                    graphButton.on("click", function() {
                        var csvLines = csv.split(/[\r?\n|\r|\n]+/);
                        var names = csvLines[0].split(',');
                        var name, index;
                        var legendEl;

                        names = names.slice(2);
                        name = names.find(n => n.endsWith('-' + heyaId));
                        index = names.indexOf(name);
                        legendEl = document.getElementsByClassName(name)[0];
                        if (legendEl.classList.contains("lineThru")) legendEl.click();
                        document.getElementById("graphContainer").scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                            inline: "start"
                        });
                        chart.series[index].setState("hover");
                        for (var i = 0; i < chart.series.length; i++) {
                            if (chart.series[i].visible && i != index)
                                chart.series[i].setState("inactive");
                        }
                    });
                    $('#' + popId).children(".popover-header").append(graphButton);
                }
                else $('#' + popId).children(".popover-header").append(document.createTextNode(' ' + heyaName));
                
                $('#' + popId).children(".popover-body").html(shishoInfo + popoverBody);
                if (shishoPicUrl != null && $('#' + popId).children().length < 4) {
                    var shishoPic = $("<figure>");
                    var image = $("<img>");
                    var caption = $("<figcaption>");

                    shishoPic.attr("class", "shishoPic");
                    image.attr("src", shishoPicUrl);
                    caption.text(shishoShikona);
                    shishoPic.append(image);
                    shishoPic.append(caption);
                    $('#' + popId).append(shishoPic);
                    $(".shishoPic img").onload = function() {
                        $('#' + popId).popover("update");
                    }
                    $('#' + popId).addClass("withPic");
                }
                $('#' + popId).popover("update");
            }
        });
    });
});