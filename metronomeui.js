"use strict";

$(function() {

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

function toolsFunc() {
    setStatus("Sorry, this feature hasn't been implemented yet.");
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
                                .text("Tools")
                                .on("click", toolsFunc)))
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

table.append(createDefRow());

});
