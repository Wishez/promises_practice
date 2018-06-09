import test from 'ava';

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
