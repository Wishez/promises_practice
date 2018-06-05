import './index.sass';
import test from 'ava';

const MAIN_ANSWER = 42;

const A = new Promise(function(resolve, reject) {
    console.log('will resolve first')
    resolve('A');
});

const C = new Promise(function(resolve, reject) {
    console.log('will resolve second')
    resolve(A)
});

const B = new Promise((resolve, reject) => {
    resolve('B')
})

C.then(response => {
    console.log('second: ', response);
});

B.then(response => {
    console.log('first: ', response);
});

const timeoutPromise = function(delay) {
    return new Promise((resolve, reject) => {
       setTimeout(() => {
           resolve("Timeout!")
       }, delay)
    });
}

function foo() {
    return Promise.resolve(MAIN_ANSWER);
}

Promise.race([
    foo(),
    timeoutPromise(3000)
]).then((response) => {
    console.log(response)
});

function tryToMakeAFewParameters() {
    return new Promise((resolve, reject) => {
        resolve("One!", "There Won't be the second parameter in fulfillment state.");
    })
}


test('asyncTransmission ', t => {
    const asyncTransmission = tryToMakeAFewParameters();


    return asyncTransmission.then((first, second) => {
        t.is(second, void 0);
        return t.is(first, "One!");
    });
});

test('Apart parts of Promises', t => {
    const p = Promise.resolve(21);

    p.then((value) => {
        t.is(value, MAIN_ANSWER / 2);

        return value * 2;
    }).then((value) => {
        t.is(value, MAIN_ANSWER)
    });

    setTimeout(() => {
        p.then((value) => {
            t.not(value * 2, MAIN_ANSWER);

            return "Third!";
        });
    }, 500);


    return p.then((value) => {
        t.not(value, "Third!");
        t.not(value, MAIN_ANSWER);
        t.is(value, MAIN_ANSWER / 2);
    });
});

test('Go to Reject state', t => {
    const expectedErrorMessage = "How promises work? 42.";
    const p = new Promise((resolve, reject) => {
       reject(expectedErrorMessage);
    });

    return p.then(
       function fulfilled() {
          return 'No answer!';
       },
       errorMessage => {
           return t.is(errorMessage, expectedErrorMessage);
       }
    );
});

test('Catch the error in chain end go to MAIN ANSWER', t => {
    const empty = {};
    const p = Promise.resolve(MAIN_ANSWER);

    return p
        .then(answer => {
          empty.answer();

          return 1234;
        })
        .then(
            (anwser) => {

            },

            (error) => {
                t.true(error instanceof TypeError);

                return MAIN_ANSWER;
            }
        )
        .then((answer) => {
            t.is(answer, MAIN_ANSWER);
        });
});


test('Test map function with wrong first parametr.', t => {
    try {
        map(1, (value) => {
            // Never execute it.
        });
    } catch(error) {
        t.is(error.message, 'You need to put array in the map function.');
    }
});

test('Test map function with wrong second value', t => {
    try {
        map([1, 2, 3, 4, 5]);
    } catch(error) {
        t.is(error.message, 'You need to put not empty callback to the map function.');
    }
});

test('Test success map function', t => {
    const iteratedValues = Array(5).fill(6);
    
    const answers = map(iteratedValues, (value) => {
        return 6 * 7;
    });
    const everyElementIsAnswer = answers.every((value) => {
        return value === MAIN_ANSWER;
    });

    t.true(everyElementIsAnswer);
});

test('Check indexes of the map function', t => {
    const iteratedValues = Array(10).fill(true);
    
    const indexes = map(iteratedValues, (trueValue, index) => {
        return index;
    });

    let index = 0;

    const everyElementIsInSequance = indexes.every((compareIndex) => {
        const isTrueIndex = index === compareIndex;
        
        index += 1;

        return isTrueIndex;
    });

    t.true(everyElementIsInSequance);
});


function assertArray(array) {
    if (!Array.isArray(array)) {
        throw new Error('You need to put array in the map function.');
    }
} 

function assertEmptyCallback(callback) {
    if (void 0 === callback) {
        throw new Error('You need to put not empty callback to the map function.');
    }
} 

function map(values, callback) {
    assertArray(values);
    assertEmptyCallback(callback);

    let index = 0;
    const results = [];

    for (const value of values) {
        results.push(
            callback(value, index)
        );

        index += 1;
    }

    return results;
};




