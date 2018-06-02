module.exports = {
    // Returns a random number from lower bound(lb) to upper bound(ub) (inclusive of both)
    // at distances of multiples of step
    randomNum: (lb, ub, step) => {
        const numbers = (ub - lb) / step + 1;
        const num = lb + step * ~~(numbers * Math.random());
        return Math.round(num * 100) / 100;
    }
}