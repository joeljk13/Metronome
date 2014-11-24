"use strict";

// The defaults. These should be kept constant
var defBeatsPerMeasure = 4,
    defNoteValue = 4,
    defBPM = 120;

// boolean isArray(array);
var isArray = Array.isArray || function(array) {
    return Object.prototype.toString.call(array) === "[object Array]";
};

// void log(msg [, type]);
//
// Logs the message to the console, if possible; otherwise alerts the message.
//
// type is used for things like warnings or errors.
// Possible values:
//      "log" (Default)
//      "error"
//      "warn"
//      "debug"
//      Anything else supported by the console
function log(msg, type) {
    type = type || "log";
    if (window.console) {
        console[type](msg);
    }
    else {
        alert(type + "\n" + msg);
    }
}

// void tick();
// A metronome tick. Modify as necessary for the page.
// TODO - Add beat parameter
function tick() {
    log("Tick");
    window.Tick();
}

// boolean isPositiveNumber(n);
function isPositiveNumber(n) {
    return typeof n === "number" && n > 0;
}

// boolean isPositiveInteger(n);
function isPositiveInteger(n) {
    // May not work for some corner cases, but those shouldn't happen.
    return isPositiveNumber(n) && Math.floor(n) === n;
}

// boolean isPowerOf2(n);
// Any values that won't fit in a 32-bit int return false. Values too big are
// unrealistic anyway.
function isPowerOf2(n) {
    return isPositiveInteger(n) && n < 2147483647 && (n & (n - 1)) === 0;
}


// Object Note
//
// A note is the basic block of time for this metronome. It could represent an
// actual note with pitch, or it could represent a rest. A note always has
// duration.
//
// Properties:
//
// Array values
//
// values is an array of positive numbers. Each number is the inverse of the
// kind of note it represents. For example, 4 would be a quarter note, 8 an
// eigth note, 1 a whole note, 6 a triplet quarter note, etc.
//
// boolean isRest
//
// isRest is true if the note represents a rest; false otherwise. The
// metronome does not tick on rests.


// Object Note(values [, isRest]);      (Constructor Function)
//
// Creates a new note.
//
// values should be an array of positive numbers. If values is not an array, it
// is treated like an array with values as the only member. If the array has no
// members or doesn't only contain positive numbers, an exception is throw;
// otherwise this.values is set to values. Each number in values is a note
// value, like the members of Note.values. The total duration of a note is the
// sum of each of its note values, e.g. new Note([4, 8]) would represent a
// dotted quarter note.
//
// this.isRest is set to isRest as a boolean; the default is false.
function Note(values, isRest) {
    if (!isArray(values)) {
        values = [values];
    }
    var i, len = values.length;
    if (len === 0) {
        throw new Error("values cannot be an empty array");
    }
    for (i = 0; i < len; ++i) {
        if (!isPositiveNumber(values[i])) {
            throw new Error("values[" + i + "] (" + values[i] +
                            ") is not valid; it should be a positive number");
        }
    }
    this.values = values;
    this.isRest = !!isRest;
}


// Object TimeSig
//
// TimeSig represents a time signature, like 4 4 or 3 8.
//
// Properties:
//
// Number beatsPerMeasure
//
// The top or first number of the time signature.
//
// Number noteValue
//
// The bottom or second number of the time signature. noteValue is always a
// power of 2. Like the members of Note.values, it is the inverse of the kind
// of note it represents, so e.g. 4 is a quarter note and 8 is an eigth note.
// It says what kind of note gets the beat.


// Object TimeSig([beatsPerMeasure] [, noteValue]);     (Constructor Function)
//
// Creates a new time signature.
//
// Sets this.beatsPerMeasure to beatsPerMeasure if beatsPerMeasure is a
// positive integer, otherwise defBeatsPerMeasure.
//
// Sets this.noteValue to noteValue if noteValue is a positive integer power of
// 2, otherwise defNoteValue.
function TimeSig(beatsPerMeasure, noteValue) {
    if (!isPositiveInteger(beatsPerMeasure)) {
        beatsPerMeasure = defBeatsPerMeasure;
    }
    if (!isPowerOf2(noteValue)) {
        noteValue = defNoteValue;
    }
    this.beatsPerMeasure = beatsPerMeasure;
    this.noteValue = noteValue;
}

// Number Note.prototype.getBeats(TimeSig timeSig);
//
// Using the given time signature, returns the total number of beats that this
// lasts for.
//
// Throws an exception if timeSig is not actually an instance of TimeSig.
Note.prototype.getBeats = function(timeSig) {
    if (!timeSig instanceof TimeSig) {
        throw new Error("timeSig is not an instance of function TimeSig");
    }
    // Create a function to use recursion for simplicity
    function GCF(a, b) {
        return b === 0 ? a : GCF(b, a % b);
    }
    // Get the number of beats by finding the greatest common denominator for
    // all the parts of this; then count and use timeSig to count the beats
    var lcm = this.values[0], len = this.values.length, i, sum = 0;
    for (i = 1; i < len; ++i) {
        lcm *= this.values[i] / GCF(lcm, this.values[i]);
    }
    for (i = 0; i < len; ++i) {
        sum += lcm / this.values[i];
    }
    return sum * timeSig.noteValue / lcm;
}

// boolean isValidBPMFunction(func, TimeSig timeSig);
//
// Returns true if func seems to be a valid beats per measure (BPM) function
// for the given time signature; false otherwise.
//
// Qualitites of a BPM function:
//      Has the form: Number func(Number);
//      Valid input arguments are all positive numbers (unit: beats) (meaning:
//          the number of beats into a measure)
//      Always returns a positive integer (unit: beats per minute) (meaning:
//          the instantaneous beats per measure at the given beat)
//      Is a pure function
//      func(0) is the instantaneous BPM at the beginning of a measure
//      func(timeSig.beatsPerMeasure) is the instantaneous BPM at the end of a
//          measure/start of the next measure
//
// If timeSig is not an instance of TimeSig, throws an exception.
function isValidBPMFunction(func, timeSig) {
    if (typeof func !== "function") {
        return false;
    }
    if (!timeSig instanceof TimeSig) {
        throw new Error("timeSig is not an instance of TimeSig");
    }
    // It's unrealistic to prove that it always returns a postive integer, so
    // just check that it works on each beat
    for (var i = 0; i < timeSig.beatsPerMeasure; ++i) {
        if (!isPositiveInteger(func(i))) {
            return false;
        }
    }
    return true;
}


// Object Measure
//
// Represents a measure of music.
//
// Properties:
//
// TimeSig timeSig
//
// The time signature throughout the measure. The time signature is always
// constant throughout a measure, although different measures can very easily
// have different time signatures.
//
// Function BPM
//
// The BPM function for the measure (see isValidBPMFunction).
//
// Number initBPM 
//
// The instantaneous beats per measure at the beginning of the measure. Should
// be equal to BPM(0).
//
// Number finalBPM
//
// The instantaneous beats per measure at the end of the measure/beginning of
// the next measure. Should be equal to BPM(timeSig.beatsPerMeasure).
//
// Array rhythm
//
// An array of instances of Note. These represent the rhythm of the measure and
// where ticks should occur.


// Object Measure([settings]);      (Constructor Function)
//
// Creates a new measure, with its properties defined by settings.
//
// If settings is not an object, it is treated as { }. If settings is modified
// after the creation of a measure, it will not affect the properties of the
// measure.
//
// this.timeSig is set to settings.timeSig, if it is an instance of TimeSig,
// or otherwise the default time signature.
//
// If settings.BPM is a string, it is treated as new Function(setttings.BPM).
// If isValidBPMFunction(settings.BPM), this.BPM is set to settings.BPM. If
// settings.BPM is a positive integer, settings.BPM is a function that returns
// settings.BPM. If this.BPM has still not be defined, and initBPM and finalBPM
// and both positive integers, then this.BPM is set to a function that
// calculates a linear change in tempo from initBPM at the beginning of the
// measure to finalBPM at the end of the measure. Otherwise, this.BPM is set to
// return defBPM.
//
// If settings.rhythm is a valid rhythm (i.e. an array of instances of Note),
// and if the total duration is equal to the duration of the measure,
// this.rhythm is set to settings.rhythm. If settings.rhythm is given but not
// valid, an exception is thrown. Otherwise, this.rhythm is set to the
// default, which is timeSig.beatsPerMeasure notes, each with a note value of
// timeSig.noteValue.
function Measure(settings) {
    if (typeof settings !== "object") {
        settings = { };
    }
    this.timeSig = settings.timeSig instanceof TimeSig ? settings.timeSig
        : new TimeSig();
    // Use a local variable so that this.BPM stays consistent even if
    // settings.BPM is changed
    var bpm = settings.BPM;
    if (isPositiveInteger(bpm)) {
        this.BPM = function() {
            return bpm;
        };
    }
    else {
        if (typeof bpm === "string") {
            bpm = new Function(bpm);
        }
        if (isValidBPMFunction(bpm, this.timeSig)) {
            this.BPM = bpm;
        }
        else if (isPositiveInteger(settings.initBPM) &&
                 isPositiveInteger(settings.finalBPM)) {
            // Again, local variables to keep them consistent
            var initBPM = settings.initBPM;
            var finalBPM = settings.finalBPM;
            var self = this;
            this.BPM = function(beat) {
                // Not sure Math.floor is the best way to go, but it'll work
                // for now
                return Math.floor(initBPM + beat * (finalBPM - initBPM) /
                    self.timeSig.beatsPerMeasure);
            };
        }
        else {
            this.BPM = function() {
                return defBPM;
            };
        }
    }
    // In theory, initBPM === this.BPM(0) && finalBPM ===
    // this.BPM(this.timeSig.beatsPerMeasure), but for speed and accuracy, use
    // initBPM and finalBPM if they were used
    this.initBPM = initBPM || this.BPM(0);
    this.finalBPM = finalBPM || this.BPM(this.timeSig.beatsPerMeasure);
    // Again, local variable to keep it constant
    var rhythm = settings.rhythm, i;
    if (!rhythm) {
        rhythm = [];
        // It doesn't matter if notes are reused, so reuse them to save on
        // memory and object creation
        var note = new Note(this.timeSig.noteValue);
        for (i = 0; i < this.timeSig.beatsPerMeasure; ++i) {
            rhythm.push(note);
        }
    }
    else if (!isArray(rhythm)) {
        throw new Error("settings.rhythm is not an array");
    }
    // Combine all the note values to see if they add up to fill the measure
    // exactly
    var values = [], len = rhythm.length;
    for (i = 0; i < len; ++i) {
        if (!rhythm[i] instanceof Note) {
            throw new Error("settings.rhythm is not valid");
        }
        Array.prototype.push.apply(values, rhythm[i].values);
    }
    var effectiveBeats = (new Note(values)).getBeats(this.timeSig);
    if (effectiveBeats !== this.timeSig.beatsPerMeasure) {
        throw new Error("settings.rhythm has too "
                        + (effectiveBeats > this.timeSig.beatsPerMeasure
                           ? "many" : "few")
                        + " beats");
    }
    this.rhythm = rhythm;
}


// Object Section
//
// A section of the music. Includes anywhere from 1 to several measures.
//
// Properties:
//
// Array measures
//
// An array of instances of Measure. The measures don't necessarily have
// anything in common, but they easily could.


// Object Section(measures [, measure2 [, ...]]);       (Constructor Function)
//
// Creates a section of music with the given measures.
//
// The measures can be given as an array in parameter measures, or they can be
// given as a list. At least the first element must be an instance of Measure.
// If this isn't true, throws an exception.
//
// If an element (besides the first) in the array used isn't an instance of
// Measure, the last valid measure is extended. The same time signature,
// rhythm, and BPM function are used, but the BPM function is shifted so that
// BPM(0) represents the beginning of this measure. Changing a measure will
// affect any measures after it that were extended from it.
function Section(measures) {
    if (!isArray(measures)) {
        measures = Array.prototype.slice.call(arguments);
    }
    if (measures.length === 0 || !measures[0] instanceof Measure) {
        throw new Error("measures[0] is not an instance of Measure");
    }
    // n is the number of measures since the last valid measure
    var lastMeasure = measures[0],
        len = measures.length, i, n = 0;
    for (i = 1; i < len; ++i) {
        if (measures[i] instanceof Measure) {
            lastMeasure = measures[i];
            n = 0;
        }
        else {
            // Shift the BPM function. Make sure to use local copies of n and
            // lastMeasure
            var bpm = (function(n, lastMeasure) {
                return function(beat) {
                    return lastMeasure.BPM(lastMeasure.timeSig.beatsPerMeasure
                                           * n + beat);
                };
            })(++n, lastMeasure);
            measures[i] = new Measure({
                "timeSig": lastMeasure.timeSig,
                "BPM": bpm,
                "rhythm": lastMeasure.rhythm
            });
        }
    }
    this.measures = measures;
}

// NativeTimer Measure.prototype.timer;
//
// A timer returned by setTimeout.
//
// Whenever the Measure is running, call clearTimeout on this to cancel the
// running.
Measure.prototype.timer = null;

// void Measure.prototype.run([callback]);
//
// Runs a measure.
//
// If callback is a string, it is treated as new Function(callback). If
// callback is a function, it is called when the measure is finished running.
//
// To have the metronome tick on the next downbeat, use run(tick) or
// run(function() { tick(); /* More code */ });
//
// Changing the measure while it's being run will not change what is run.
Measure.prototype.run = function(callback) {
    if (typeof callback === "string") {
        callback = new Function(callback);
    }
    else if (typeof callback !== "function") {
        callback = function() { };
    }
    // Use local variables to keep the measure consistent
    var timeSig = this.timeSig,
        rhythm = this.rhythm,
        i = 0,
        beat = 0,
        bpm = this.BPM;
    function callTick() {
        if (beat !== timeSig.beatsPerMeasure) {
            var note = rhythm[i];
            if (!note.isRest) {
                tick();
            }
            var beatDiff = note.getBeats(timeSig);
            // Approximate the time until the next note
            this.timer = setTimeout(callTick, 120000 * beatDiff
                                    / (bpm(beat) + bpm(beat + beatDiff)));

            beat += beatDiff;
            ++i;
        }
        else {
            this.timer = null;
            callback();
        }
    }
    callTick();
};

// NativeTimer Section.prototype.timer;
//
// A timer returned by setTimeout.
//
// Whenever the Section is running, call clearTimeout on this to cancel the
// running.
Section.prototype.timer = null;

// void Section.prototype.run([callback]);
//
// Works just like Measure.prototype.run (see there for details), but runs an
// entire section. Each measure is run right after the previous one is done.
Section.prototype.run = function(callback) {
    if (typeof callback === "string") {
        callback = new Function(callback);
    }
    else if (typeof callback !== "function") {
        callback = function() { };
    }
    var i = 0,
        measures = this.measures,
        len = measures.length;
    function runMeasures() {
        this.timer = measures[i++].run(function() {
            if (i === len) {
                this.timer = null;
                callback();
            }
            else {
                runMeasures();
            }
        });
    }
    runMeasures();
};
