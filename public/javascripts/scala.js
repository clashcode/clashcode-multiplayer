// sort array using given property selector
Array.prototype.sortBy = function(mapper) {
    if (!mapper) mapper = function(x) { return x; }
    this.sort(function(x, y) {
        var a = mapper(x), b = mapper(y);
        return (a < b) ? -1 : ((a > b) ? 1 : 0);
    })
    return this;
}

// union array
Array.prototype.union = function(array) {
    return this.concat(array);
}

// flatten array of arrays into array
Array.prototype.flatten = function() {
    var result = [];
    this.foreach(function(inside) { result = result.union(inside) })
    return result;
}

// map array to a new one
Array.prototype.map = function(mapper) { return $.map(this, mapper) }

// run function for each element (elem, index)
Array.prototype.foreach = function(callback) {
    for (var i = 0; i < this.length; i++) callback(this[i], i)
    return this;
}

// get minimum of array or null if empty
Array.prototype.min = function() {
    if (this.length == 0) return null;
    var result = this[0];
    for (var i = 1; i < this.length; i++)
        if (this[i] < result) result = this[i];
    return result;
}

// true if array contains elem
Array.prototype.contains = function(elem) {
    return this.indexOf(elem) >= 0;
}

// get distinct values from array
Array.prototype.distinct = function() {
    var array = this;
    return array.filter(function(v,i) {
        return array.indexOf(v) == i;
    });
}

// get reverse copy of array
Array.prototype.reverse = function() {
    var result = [];
    for (var i = this.length - 1; i >= 0; i--) result.push(this[i])
    return result;
}

// create new array with values evaluating true on given predicate (value, index)
Array.prototype.takeWhile = function(predicate) {
    var result = [];
    for (var i = 0; i < this.length; i++)
    {
        if (!predicate(this[i], i)) break;
        result.push(this[i])
    }
    return result;
}

// difference between arrays
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

// sum of array
Array.prototype.sum = function() {
    var result = 0;
    for(var i = 0; i < this.length; i++)
        result += this[i];
    return result;
};

// check if element exists
Array.prototype.exists = function(predicate) {
    for(var i = 0; i < this.length; i++)
        if (predicate(this[i])) return true;
    return false;
};

// first entry in array
Array.prototype.head = function() {
    if (this.length == 0) return null;
    return this[0];
}

// last entry in array
Array.prototype.last = function() {
    if (this.length == 0) return null;
    return this[this.length - 1];
}

// remove entry in array
Array.prototype.remove = function(elem) {
    var index = this.indexOf(elem);
    if (index >= 0) this.splice(index, 1);
}

// zip array with another array (returning array of array element tuples)
Array.prototype.zip = function(array) {
    var result = [];
    var length = Math.min(this.length, array.length);
    for(var i = 0; i < length; i++)
        result.push([this[i], array[i]]);
    return result;
}

// shuffle an array in place
Array.prototype.shuffle = function() {
    var array = this;
    var counter = array.length, temp, index;
    while (counter > 0) {
        index = Math.floor(Math.random() * counter); // Pick a random index
        counter--;
        temp = array[counter]; // And swap the last element with it
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}
