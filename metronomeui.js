"use strict";

(function() {

var table = $("table");
var statusBar = $("#status-bar");
var statusP = $("#status");
var X = $("<button>")
    .attr("type", "button")
    .text("X")
    .on("click", function() {
        statusBar.hide();
    });

statusBar.append(X);

function setStatus(msg) {
    statusP.text(msg);
    statusBar.show();
}

function hideStatus() {
    statusBar.hide();
}

function createRow(elem) {
    return elem.clone(true);
}

function addRow() {
    for (var elem = $(this); !elem.is("tr"); elem = elem.parent()) { }

    elem.after(createRow(elem));
}

function removeRow() {
    // TODO - Make this undoable

    for (var elem = $(this); !elem.is("tr"); elem = elem.parent()) { }

    if (elem.siblings().length === 0) {
        setStatus("Error: cannot remove only row");
    }
    else {
        elem.remove();
    }
}

function setToEdit(elem) {
    var i;

    function switchBack() {
        elem.text(i.val());
        i.remove();
        elem.show();
    }

    i = $("<input>")
        .attr("type", "text")
        .val(elem.text())
        .on("blur", switchBack)
        .on("keydown", function(e) {
            if (e.keyCode === 13) {
                switchBack();
            }
        });

    elem.hide().after(i);
    i.select();
}

function setToEditFunc() {
    setToEdit($(this));
}

function startFunc() {
    for (var elem = $(this); !elem.is("tr"); elem = elem.parent()) { }

    var sections = [];

    do {
        var bpm = elem.children(".beats-per-minute").text();
        var bpm1 = bpm, bpm2 = bpm;
        var regex = /^\s*(\d+)\s*(to|-)\s*(\d+)\s*$/i;
        var timeSig = new TimeSig(+elem.children(".beats-per-measure").text(),
                                  +elem.children(".note-value").text());

        var n = elem.children(".number-of-measures").text();
        var isInf = n.match(/^\s*inf(inity?)\s*$/i) ? true : false;
        var measures = [];

        measures.length = isInf ? 1 : +n;

        if (bpm.match(regex)) {
            bpm1 = +bpm.replace(regex, "$1")
            bpm2 = +bpm.replace(regex, "$3")
            bpm = null;
        }
        else {
            bpm1 = bpm2 = null;
            bpm = new Function("beat", "return " + bpm);
        }

        measures[0] = new Measure({
            "timeSig": new TimeSig(+elem.children(".beats-per-measure").text(),
                                   +elem.children(".note-value").text()),

            "BPM": bpm,
            "initBPM": bpm1,
            "finalBPM": (bpm1 + (bpm2 - bpm1) / +n)
        });

        sections.push([new Section(measures), isInf ? 0 : 1]);
    }
    while ((elem = elem.next()).length !== 0);

    function run(i) {
        if (i < sections.length) {
            sections[i][0].run(function() {
                run(i + sections[i][1]);
            });
        }
    }

    run(0);
}

function createDefTimeSignature() {
    return $("<td>")
        .addClass("time-signature")
        .append($("<div>")
                .append($("<span>")
                    .addClass("beats-per-measure")
                    .text("" + defBeatsPerMeasure)
                    .on("click", setToEditFunc)))
        .append($("<div>")
                .append($("<span>")
                    .addClass("note-value")
                    .text("" + defNoteValue)
                    .on("click", setToEditFunc)));
}

function createDefBeatsPerMinute() {
    return $("<td>")
        .addClass("beats-per-minute")
        .append($("<div>")
                .append($("<span>")
                    .text("" + defBPM)
                    .on("click", setToEditFunc)));
}

function createDefNumberOfMeasures() {
    return $("<td>")
        .addClass("number-of-measures")
        .append($("<div>")
                .append($("<span>")
                    .text("Infinity")
                    .on("click", setToEditFunc)));
}

function createDefTools() {
    return $("<td>")
        .addClass("tools")
        .append($("<div>")
                .append($("<span>")
                        .append($("<button>")
                                .attr("type", "button")
                                .text("Start")
                                .on("click", startFunc)))
                .append($("<span>")
                        .append($("<button>")
                                .attr("type", "button")
                                .attr("title", "Remove row")
                                .text("-")
                                .on("click", removeRow)))
                .append($("<span>")
                        .append($("<button>")
                                .attr("type", "button")
                                .attr("title", "Add row")
                                .text("+")
                                .on("click", addRow))));
}

function createDefRow() {
    return $("<tr>")
        .append(createDefTimeSignature())
        .append(createDefBeatsPerMinute())
        .append(createDefNumberOfMeasures())
        .append(createDefTools());
}

var body = $("body");

window.Tick = function() {
    body.css({
        "backgroundColor": "#000"
    });

    setTimeout(function() {
        body.css({
            "backgroundColor": "#FFF"
        });
    }, 50);

    // TODO - add sound
}

table.append(createDefRow());

})();
