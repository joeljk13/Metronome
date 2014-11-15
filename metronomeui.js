"use strict";

$(function() {

var rows = [];
var table = $("#table");

function setToEditFunc() {
    log("Set to edit");
    return;
    setToEdit($(this));
}

function toolsFunc() {
    log("Tools");
}

function createDefTimeSignature() {
    return $("<div>")
        .addClass("cell time-signature")
        .append($("<span>")
                .addClass("beats-per-measure")
                .text("" + defBeatsPerMeasure)
                .on("click", setToEditFunc))
        .append($("<span>")
                .addClass("note-value")
                .text("" + defNoteValue)
                .on("click", setToEditFunc));
}

function createDefBeatsPerMinute() {
    return $("<div>")
        .addClass("cell beats-per-minute")
        .append($("<span>")
                .text("" + defBPM)
                .on("click", setToEditFunc));
}

function createDefNumberOfMeasures() {
    return $("<div>")
        .addClass("cell number-of-measures")
        .append($("<span>")
                .text("inf")
                .on("click", setToEditFunc));
}

function createDefTools() {
    return $("<div>")
        .addClass("cell tools")
        .append($("<button>")
                .addClass("tools-button")
                .attr("type", "button")
                .text("Tools")
                .on("click", toolsFunc));
}

function createDefRow() {
    return $("<div>")
        .addClass("section")
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
