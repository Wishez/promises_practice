import test from 'ava';
import { LOADIPHLPAPI } from 'dns';

const MAIN_ANSWER = 42;

const incrementIncapsulatedX = (function() {
    let _x = 0;

    function *incrementX() {
        _x++;
        
        yield _x;
    }

    return incrementX;
}());



test('Test default values of the generator.', t => {
    const it = incrementIncapsulatedX();

    t.true(!('value' in it));
    t.true(!('done' in it));
    t.true('next' in it);
});

test('Test iterations of the generator.', t => {
    const it = incrementIncapsulatedX();

    const one = it.next();
    t.is(1, one.value);

    const two = it.next();
    
    t.true(two.done);
});


function *answerOnIt() {
    return 6 * (yield "I'll give you the main answer. Pass 7.");
}

test('Test for generator type.', t => {
    t.is("function", typeof answerOnIt);
});

test('Test first yield value of the generator.', t => {
    const it = answerOnIt();

    const yieldValue = it.next();
    
    t.is("I'll give you the main answer. Pass 7.", yieldValue.value);
    
    const answer = it.next(7);

    t.is(MAIN_ANSWER, answer.value);
    t.true(answer.done);

});


var z = 5;

function *run() {
    var x = yield 5;
    z+=2;
    var y = yield (x*z);
    return [x, y, z];    
}



test('Go throught generators processing.', t => {
    const first = run();
    const second = run();

    let firstValue = first.next().value;
    let secondValue = second.next().value;

    t.is(5, firstValue);
    t.is(5, secondValue);

    firstValue = first.next(firstValue * 8).value;
    secondValue = second.next(firstValue * 2).value;

    t.is(9, z);
    t.is(5*8*7, firstValue);
    t.is(280*2*9, secondValue);

    firstValue = first.next(firstValue/2).value;
    secondValue = second.next(secondValue/8).value;

    t.is(9, z);
    t.deepEqual([40, 140, 9], firstValue);
    t.deepEqual([560, 630, 9], secondValue);
});

var firstNumber = 4;
var secondNumber = 5;

function *one() {
    firstNumber+=1;
    yield;
    secondNumber*=firstNumber;
    firstNumber = (yield secondNumber)+17;
}

function *two() {
    secondNumber-=1;
    yield;
    firstNumber = (yield 30)-secondNumber;
    secondNumber = firstNumber*(yield 7);
}

function step(generator) {
    const it = generator();
    let last;

    return () => {
        last = it.next(last).value;
    };
}

test('Test steps of generators', t => {
    const first = step(one);

    first();
    t.is(5, firstNumber);

    first();
    t.is(5, firstNumber);

    first();
    t.is(MAIN_ANSWER, firstNumber);

    const second = step(two);

    second();
    t.is(24, secondNumber);

    second();
    t.is(MAIN_ANSWER, firstNumber);

    second();
    t.is(6, firstNumber);
    t.is(24, secondNumber);

    second();
    t.is(MAIN_ANSWER, secondNumber); 
    
    const actionsQuantity = 3+4;
    const maxCombinations  = findCombinations(actionsQuantity);

    console.log(`Max results's combinations values for each step call are: ${maxCombinations}`); 
});


test('Test factorial of a some number.', t => {
    const combinationsQuantity = findCombinations(4);
    
    t.is(9, combinationsQuantity);
});

function findCombinations(actionsQuantity) {
    const actions = makeRangeArray({
        length: actionsQuantity - 1,
        step: 1
    });

    return actions.reduce(
        (combinations, actionNumber) => (
            combinations+factorialOf(actionNumber)
        )
        , 0
    );
}

test('Test factorial of a some number.', t => {
    const factorial = factorialOf(4);
    
    t.is(24, factorial);
});

function factorialOf(number) {
    const numbers = makeRangeArray({
        length: number,
        step: 1
    });

    return numbers.reduce(
            (factorial, passNumber) => factorial*passNumber
        , 1);

}

test('Test for creating array.', t => {
    const arrayInRange = makeRangeArray({
        length: 4
    });
    
    t.deepEqual([0, 1, 2, 3], arrayInRange);
});

function makeRangeArray({
    length,
    step=0
}) {
    return Array(length)
        .fill(false)
        .map(
            (value, index) => index+step
        );
}

test('Test for creating array with step.', t => {
    const arrayInRange = makeRangeArray({
        length: 5,
        step: 2
    });
    
    t.deepEqual([2, 3, 4, 5, 6], arrayInRange);
});





// test('Test to put  answer to the generator and get it async.', t => {
//     var another = '';
//     const it = logAsyncData();

//     function *logAsyncData() {
//         try {
//             const textFromPutAndGet = yield putAndGet(null, MAIN_ANSWER);

//             console.log('textFromPutAndGet:', textFromPutAndGet);
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     function putAndGet(error, data) {
//         if (error) {
//             it.throw(error);
//         } else {
//             it.next(data);
//         }
//     };

//     it.next();

//     t.is(1, 1);
// });

function foo(x,y) {
    return new Promise((resolve, reject) => {
        if (x && y) {
            resolve(x * y);
        } else {
            reject('Can\'t multiply x and y.');
        }
    });
}



test('Play with flow of the async generator.', t => {
    let asyncText;
    function *main() {
        try {
            asyncText = yield foo(6, 7);
            
            console.log('asyncText:', asyncText);
        } catch (error) {
            console.error(error);
        }
    }
    
    const it = main();

    const p = it.next().value;

    p.then(
        (text) => {
        it.next(text);
    },
        (error) => {
        it.throw(error);
    })

    t.is(1, 1);
});

function multiply(cb) {
    let error = null;
    let result;

    try {
        result = [].slice.call(arguments, 1).reduce((total, number) => total * number, 1);
    } catch(e) {
        error = e.message;
    }

    cb(error, result);
}

function thunkify(fn) {
    return function()  {
        const args = Array.from(arguments);

        return (cb) => {
            args.unshift(cb);
            return fn.apply(null, args);
        }
    }
    
}

test('Test thunk in work.', t => {
    const calc = thunkify(multiply);  
    const askMainQuestion = calc( 2, 3, 7);
    let localAnswer;

    askMainQuestion(function(error, answer) {
        if (error) {
            console.error(error);
        } else 

        localAnswer = answer; 
    });

    t.is(MAIN_ANSWER, localAnswer);
});


function asyncMultiply(cb) {
    const args = [].slice.call(arguments, 1);
    console.log('args:', args);

    setTimeout(() => {
        console.log('Will execute');
        multiply(cb, ...args);
    }, 1000);
    
    multiply(cb, ...args);
    
}

test('Test promise with thunk.', async t => {
    const promiseAnswer = thunkify(asyncMultiply)
    let getAnswer = promiseAnswer(2, 3)
    let asyncAnswer;

    getAnswer((error, answer) => {
        if (error) {
            console.error(error)
        } else 

        asyncAnswer = answer;
        console.log('asyncAnswer:', asyncAnswer);
    })

    t.not(MAIN_ANSWER, asyncAnswer);
});


