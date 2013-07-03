(function(){
    var DEPENDENTS_KEY = 'dependents';
    var CALLBACK_KEY = 'callback';
    var ALL_KEY = 'all';

    var DependsOn = function(){
        var dependentsMap = {};
        var allDependentsMap = {};

        /**
         * Register a function to be executed after the page is ready
         * @param name
         * @param callback
         * @param dependentArray (Optional) array of function names that this function depends on
         */
        this.register = function(callback, name, dependentArray){
            if(name.toLowerCase() === ALL_KEY) return;
            var allIndex = indexOfAll(dependentArray);
            if(allIndex === -1){
                dependentsMap[name] = dependentsMap[name] || {};
                dependentsMap[name][DEPENDENTS_KEY] = dependentArray ? dependentArray.concat() : [];
                dependentsMap[name][CALLBACK_KEY] = callback;
            } else {
                allDependentsMap[name] = allDependentsMap[name] || {};
                allDependentsMap[name][DEPENDENTS_KEY] = dependentArray ? dependentArray.concat() : [];
                allDependentsMap[name][CALLBACK_KEY] = callback;
                allDependentsMap[name][DEPENDENTS_KEY].splice(allIndex, 1);
            }

        };

        /**
         * Call the init method of a dependent if everything it depends on is loaded.
         * Makes sure that the map of dependents with the 'all' keyword is run last
         */
        function initializeDependents(){
            var key, dependent;
            // If the dependentsMap is done, then run the all dependents
            var map = isFinished(dependentsMap) ? allDependentsMap : dependentsMap;
            // Go through each item in the map and trigger its callback if it has no dependents
            for(key in map){
                dependent = map[key];
                if(map.hasOwnProperty(key) && dependent[DEPENDENTS_KEY].length === 0){
                    // There dependents array is empty, so call its init method
                    dependent[CALLBACK_KEY](key);
                    // Delete the dependent from the map since it has been called
                    delete map[key];
                    // Remove the dependent name from the depend array for anything that still needs to be initialized
                    removeDependents(map, key);
                }
            }
            key = null;
            dependent = null;
            // Check to see if both the maps have finished initializing, otherwise run the process again
            if(!isFinished(dependentsMap) || !isFinished(allDependentsMap)){
                initializeDependents()
            }
        }

        /**
         * Removes a specified dependent from the depend array on all the remaining items
         * @param map The map to use. Either dependentsMap or allDependents
         * @param name The dependent name that should be removed
         */
        function removeDependents(map, name){
            var key, dependent;
            for(key in map){
                dependent = map[key];
                if(map.hasOwnProperty(key)){
                    for(var i = dependent[DEPENDENTS_KEY].length; i >= 0; i--){
                        if(dependent[DEPENDENTS_KEY][i] === name){
                            dependent[DEPENDENTS_KEY].splice(i, 1);
                        }
                    }
                }
            }
            key = null;
            dependent = null;
        }

        /**
         * Checks to make sure no items exists in the map
         * @param map
         * @return {Boolean}
         */
        function isFinished(map){
            var key;
            for(key in map){
                if(map.hasOwnProperty(key)){
                    return false;
                }
            }
            return true;
        }

        /**
         * Gets the index of the 'all' keyword in the an array. Returns -1 if it isn't found
         * @param array
         * @return {Number}
         */
        function indexOfAll(array){
            var i, len;
            if(array){
                for(i = 0, len = array.length; i<len; i++){
                    if(array[i].toLowerCase() === ALL_KEY){
                        return i;
                    }
                }
            }
            return -1;
        }

        function testDependents(name){
            console.log('test :', name);
        }

        this.register(testDependents, 'zero');
        this.register(testDependents, 'one', ['zero']);
        this.register(testDependents, 'allSecond', ['allFirst', ALL_KEY]);
        this.register(testDependents, 'allFirst', [ALL_KEY]);
        this.register(testDependents, 'two', ['zero', 'one']);
        this.register(testDependents, 'three', ['zero', 'one', 'two', 'one']);
        this.register(testDependents, 'mixed', ['zero', 'three']);
        this.register(testDependents, 'last', ['three', 'afterOne']);
        this.register(testDependents, 'afterOne', ['one']);
        $(document).ready(initializeDependents);
    };

    window.DependsOn = new DependsOn();
})();
