"use strict";

$(function() {

var rows = [];
var table = $("table");

function setToEdit(elem) {
    elem.replaceWith($("<input>")
                     .attr("type", "text")
                     .focus());
}

function setToEditFunc() {
    setToEdit($(this));
}

function toolsFunc() {
    log("Tools");
}

function createDefTimeSignature() {
    return $("<td>")
        .addClass("time-signature")
        .append($("<div>")
                .addClass("beats-per-measure")
                .text("" + defBeatsPerMeasure)
                .on("click", setToEditFunc))
        .append($("<div>")
                .addClass("note-value")
                .text("" + defNoteValue)
                .on("click", setToEditFunc));
}

function createDefBeatsPerMinute() {
    return $("<td>")
        .addClass("beats-per-minute")
        .append($("<div>")
                .text("" + defBPM)
                .on("click", setToEditFunc));
}

function createDefNumberOfMeasures() {
    return $("<td>")
        .addClass("number-of-measures")
        .append($("<div>")
                .text("inf")
                .on("click", setToEditFunc));
}

function createDefTools() {
    return $("<td>")
        .addClass("tools")
        .append($("<button>")
                .attr("type", "button")
                .text("Tools")
                .on("click", toolsFunc));
}

function createDefRow() {
    return $("<tr>")
        .append(createDefTimeSignature())
        .append(createDefBeatsPerMinute())
        .append(createDefNumberOfMeasures())
        .append(createDefTools());
}

function appendRow(row) {
    table.append(row);
    rows.push(row);
}

appendRow(createDefRow());

});
