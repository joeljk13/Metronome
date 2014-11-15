"use strict";

$(function() {

var rows = [];
var table = $("table");

function appendRow(row) {
    table.append(row);
    rows.push(row);
}

function addRow() {
    var tmp = $(this);
}

function removeRow() {
    var tmp = $(this);
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
    log("Tools");
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
                    .text("inf")
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

appendRow(createDefRow());

});
