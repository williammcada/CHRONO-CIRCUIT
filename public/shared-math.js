var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// ../olivia/src/shared-math/mega-content.js
var Skills = (() => {
  const list = [], r2 = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = (a) => a[r2(0, a.length - 1)];
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a), frac = (n, d) => {
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    return n / g + "/" + d / g;
  };
  const q = (prompt, answer, type = "number") => ({ prompt, answer, type });
  const add2 = (grade, id, name, standard, make, prereq) => list.push({ grade, id, name, standard, make, prereq });
  const f = (p, n, d) => q(p + " Give a reduced fraction or whole number.", frac(n, d), "fraction");
  const cmp = (a, b) => a < b ? "<" : a > b ? ">" : "=";
  const den = () => pick([2, 3, 4, 5, 6, 8, 10, 12]);
  const clock2 = (n) => {
    n = (n % 1440 + 1440) % 1440;
    return String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");
  };
  const time = (n) => clock2(n) + (n >= 1440 ? " next day" : n < 0 ? " previous day" : "");
  const decimal = (n, d = 100) => String(Number((n / d).toFixed(6)));
  const calc2 = (p, a) => q(p + " = ?", a);
  const comparison = (a, b) => q("Compare: " + a + " ___ " + b + ". Enter <, > or =.", cmp(value(a), value(b)), "comparison");
  const ampm = (n) => {
    n = (n % 1440 + 1440) % 1440;
    const h = Math.floor(n / 60);
    return (h % 12 || 12) + ":" + String(n % 60).padStart(2, "0") + " " + (h < 12 ? "AM" : "PM");
  };
  const g3den = () => pick([2, 3, 4, 6, 8]);
  const g3divisionQuotient = () => Math.random() < 0.05 ? 1 : r2(2, 9);
  add2(3, "g3-mul", "Multiplication facts within 100", "3.OA.A.1, C.7", () => {
    let a = r2(0, 9), b = r2(0, 9);
    return calc2(a + " \xD7 " + b, a * b);
  });
  add2(3, "g3-div", "Division facts within 100", "3.OA.A.2, C.7", () => {
    let divisor = r2(2, 9), quotient = g3divisionQuotient();
    return calc2(divisor * quotient + " \xF7 " + divisor, quotient);
  }, "g3-mul");
  add2(3, "g3-groups", "Equal groups: multiplication stories", "3.OA.A.3", () => {
    let a = r2(2, 9), b = r2(2, 9);
    return q(a + " bags have " + b + " marbles each. How many marbles altogether?", a * b);
  }, "g3-mul");
  add2(3, "g3-sharing", "Equal sharing: division stories", "3.OA.A.3", () => {
    let a = r2(2, 9), b = r2(2, 9);
    return q(a * b + " stickers are shared equally among " + a + " children. How many stickers per child?", b);
  }, "g3-div");
  add2(3, "g3-groupcount", "How many groups?", "3.OA.A.3", () => {
    let a = r2(2, 9), b = r2(2, 9);
    return q(a * b + " pencils are packed " + a + " per box. How many boxes?", b);
  }, "g3-div");
  add2(3, "g3-factor", "Missing multiplication factors", "3.OA.A.4, B.6", () => {
    let a = r2(1, 9), b = r2(0, 9);
    return q(a + " \xD7 x = " + a * b + ". Find x.", b);
  }, "g3-div");
  add2(3, "g3-dividend", "Missing dividend", "3.OA.A.4", () => {
    let divisor = r2(2, 9), quotient = g3divisionQuotient();
    return q("x \xF7 " + divisor + " = " + quotient + ". Find x.", divisor * quotient);
  }, "g3-mul");
  add2(3, "g3-divisor", "Missing divisor", "3.OA.A.4", () => {
    let quotient = g3divisionQuotient(), divisor = r2(2, 9);
    return q(divisor * quotient + " \xF7 x = " + quotient + ". Find x.", divisor);
  }, "g3-div");
  add2(3, "g3-commute", "Multiplication in either order", "3.OA.B.5", () => {
    let a = r2(1, 9), b = r2(1, 9);
    return q(a + " \xD7 " + b + " = " + b + " \xD7 x. Find x.", a);
  }, "g3-mul");
  add2(3, "g3-distribute", "Break apart multiplication", "3.OA.B.5", () => {
    let a = r2(2, 9), b = r2(2, 5), c = r2(1, 4);
    return q(a + " \xD7 " + (b + c) + " = " + a + " \xD7 " + b + " + " + a + " \xD7 x. Find x.", c);
  }, "g3-mul");
  add2(3, "g3-associate", "Group three factors", "3.OA.B.5", () => {
    let a = r2(1, 4), b = r2(1, 4), c = r2(1, 5);
    return calc2("(" + a + " \xD7 " + b + ") \xD7 " + c, a * b * c);
  }, "g3-mul");
  add2(3, "g3-two-step", "Two-step whole-number stories", "3.OA.D.8", () => {
    let a = r2(2, 9), b = r2(2, 9), c = r2(1, a * b);
    return q("You buy " + a + " packs of " + b + " cards. You give away " + c + " cards. How many remain?", a * b - c);
  }, "g3-groups");
  add2(3, "g3-two-step-div", "Two-step sharing stories", "3.OA.D.8", () => {
    let groups = r2(2, 9), each = r2(2, 9), extra = r2(1, 20);
    return q("You have " + (groups * each + extra) + " stickers. Keep " + extra + " and share the rest among " + groups + " friends. How many does each friend get?", each);
  }, "g3-sharing");
  add2(3, "g3-order", "Operation order: no parentheses or exponents", "3.OA.D.8", () => {
    let a = r2(1, 20), b = r2(2, 9), c = r2(2, 9);
    return r2(0, 1) ? calc2(a + " + " + b + " \xD7 " + c, a + b * c) : calc2(b * c + " \xF7 " + b + " + " + a, c + a);
  }, "g3-mul");
  add2(3, "g3-pattern", "Arithmetic patterns", "3.OA.D.9", () => {
    let start = r2(1, 20), step = r2(2, 9);
    return q("Each number increases by " + step + ": " + [start, start + step, start + 2 * step].join(", ") + ", ___. What comes next?", start + 3 * step);
  });
  add2(3, "g3-round10", "Round to the nearest ten", "3.NBT.A.1", () => {
    let n = r2(1, 999);
    return q("Round " + n + " to the nearest ten. If halfway, round up.", Math.round(n / 10) * 10);
  });
  add2(3, "g3-round100", "Round to the nearest hundred", "3.NBT.A.1", () => {
    let n = r2(100, 999);
    return q("Round " + n + " to the nearest hundred. If halfway, round up.", Math.round(n / 100) * 100);
  }, "g3-round10");
  add2(3, "g3-add", "Addition within 1000", "3.NBT.A.2", () => {
    let a = r2(10, 800), b = r2(10, 1e3 - a);
    return calc2(a + " + " + b, a + b);
  });
  add2(3, "g3-sub", "Subtraction within 1000", "3.NBT.A.2", () => {
    let a = r2(20, 1e3), b = r2(10, a);
    return calc2(a + " \u2212 " + b, a - b);
  }, "g3-add");
  add2(3, "g3-addmissing", "Missing addends", "3.NBT.A.2 practice", () => {
    let a = r2(10, 500), b = r2(10, 400);
    return q("x + " + a + " = " + (a + b) + ". Find x.", b);
  }, "g3-sub");
  add2(3, "g3-submissing", "Missing subtraction values", "3.NBT.A.2 practice", () => {
    let a = r2(20, 500), b = r2(10, 400), first = r2(0, 1);
    return q(first ? "x \u2212 " + a + " = " + b + ". Find x." : a + b + " \u2212 x = " + a + ". Find x.", first ? a + b : b);
  }, "g3-sub");
  add2(3, "g3-tensmul", "Multiply by multiples of ten", "3.NBT.A.3", () => {
    let a = r2(1, 9), b = r2(1, 9) * 10;
    return calc2(a + " \xD7 " + b, a * b);
  }, "g3-mul");
  add2(3, "g3-unitfraction", "One equal part as a fraction", "3.NF.A.1 textual component", () => {
    let d = g3den();
    return f("One whole is split into " + d + " equal parts. What fraction is one part?", 1, d);
  });
  add2(3, "g3-fraction", "Several equal parts as a fraction", "3.NF.A.1 textual component", () => {
    let d = g3den(), n = r2(1, d);
    return f("One whole is split into " + d + " equal parts. What fraction is " + n + " of those parts?", n, d);
  }, "g3-unitfraction");
  add2(3, "g3-equivalent", "Simple equivalent fractions", "3.NF.A.3", () => {
    let [n, d, k] = pick([[1, 2, 2], [1, 2, 3], [1, 2, 4], [1, 3, 2], [2, 3, 2], [1, 4, 2], [3, 4, 2]]);
    return q(n + "/" + d + " = x/" + d * k + ". Find x.", n * k);
  }, "g3-fraction");
  add2(3, "g3-reduce", "Reduce simple fractions", "3.NF.A.3 textual component", () => {
    let [n, d] = pick([[2, 4], [3, 6], [4, 8], [2, 6], [4, 6], [2, 8], [6, 8]]);
    return f("Reduce " + n + "/" + d + ".", n, d);
  }, "g3-equivalent");
  add2(3, "g3-wholefraction", "Fractions equal to whole numbers", "3.NF.A.3c", () => {
    let d = g3den(), n = r2(1, 4);
    return q("What whole number equals " + n * d + "/" + d + "?", n);
  }, "g3-fraction");
  add2(3, "g3-compareden", "Compare fractions: same denominator", "3.NF.A.3d", () => {
    let d = g3den();
    return comparison(r2(1, d) + "/" + d, r2(1, d) + "/" + d);
  }, "g3-fraction");
  add2(3, "g3-comparenum", "Compare fractions: same numerator", "3.NF.A.3d", () => {
    let d = g3den(), e = g3den(), n = r2(1, Math.min(d, e));
    return comparison(n + "/" + d, n + "/" + e);
  }, "g3-compareden");
  add2(3, "g3-elapsed", "Elapsed minutes: AM/PM", "3.MD.A.1 textual component", () => {
    let start = r2(420, 1020), d = r2(5, 60);
    return q("Start at " + ampm(start) + ". Finish at " + ampm(start + d) + " the same day. How many minutes pass?", d);
  });
  add2(3, "g3-timeend", "Find an ending time: AM/PM", "3.MD.A.1 textual component", () => {
    let start = r2(420, 1020), d = r2(5, 60);
    return q("Start at " + ampm(start) + " and work for " + d + " minutes. What time do you finish? Enter h:mm AM or PM.", ampm(start + d), "time12");
  }, "g3-elapsed");
  add2(3, "g3-timestart", "Find a starting time: AM/PM", "3.MD.A.1 textual component", () => {
    let start = r2(420, 1020), d = r2(5, 60);
    return q("A " + d + "-minute activity ends at " + ampm(start + d) + ". When did it start? Enter h:mm AM or PM.", ampm(start), "time12");
  }, "g3-timeend");
  add2(3, "g3-time-addsubtract", "Basic elapsed time: hours and 5-minute steps", "3.MD.A.1 textual component", () => {
    let start = r2(420, 1080), hours = r2(1, 3), minutes = 5 * r2(1, 11), duration = hours * 60 + minutes, end = start + duration, forward = r2(0, 1);
    return forward ? q("An activity starts at " + ampm(start) + " and lasts " + hours + " hour" + (hours === 1 ? "" : "s") + " and " + minutes + " minutes. What time does it end? Enter h:mm AM or PM.", ampm(end), "time12") : q("An activity ends at " + ampm(end) + " and lasts " + hours + " hour" + (hours === 1 ? "" : "s") + " and " + minutes + " minutes. What time did it start? Enter h:mm AM or PM.", ampm(start), "time12");
  }, "g3-timestart");
  add2(3, "g3-mass", "Mass word problems in the same units", "3.MD.A.2 textual component", () => {
    let a = r2(2, 9), b = r2(2, 9);
    return q(a + " bags each weigh " + b + " kg. What is their total mass in kilograms?", a * b);
  }, "g3-groups");
  add2(4, "g4-mulcompare", "Multiplicative comparisons", "4.OA.A.1\u20132", () => {
    let a = r2(3, 12), b = r2(2, 9);
    return q("Mia has " + a + " cards. Leo has " + b + " times as many. How many cards does Leo have?", a * b);
  }, "g4-mul");
  add2(4, "g4-word", "Equal-groups word problems", "4.OA.A.2\u20133", () => {
    let a = r2(3, 12), b = r2(4, 15);
    return q(a + " boxes hold " + b + " pencils each. How many pencils altogether?", a * b);
  }, "g4-mul");
  add2(4, "g4-multistep", "Multistep whole-number word problems", "4.OA.A.3", () => {
    let a = r2(3, 9), b = r2(10, 30), c = r2(1, b), d = r2(2, 6);
    return q("A club buys " + a + " packs of " + b + " tickets, then gives away " + c + " tickets. It later buys " + d + " more tickets. How many now?", a * b - c + d);
  }, "g4-word");
  add2(4, "g4-remainderword", "Remainders in word problems", "4.OA.A.3", () => {
    let b = r2(3, 9), n = r2(5, 30) * b + r2(1, b - 1);
    return q(n + " children need vans. Each van holds " + b + " children. What is the fewest vans needed?", Math.ceil(n / b));
  }, "g4-div");
  add2(4, "g4-factors", "Missing factors", "4.OA.B.4", () => {
    let a = r2(2, 10), b = r2(2, 10);
    return q(a + " \xD7 x = " + a * b + ". Find x.", b);
  }, "g4-mul");
  add2(4, "g4-prime", "Prime and composite numbers", "4.OA.B.4", () => {
    let n = r2(2, 100);
    return q("How many positive factors does " + n + " have? A prime has exactly two.", Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0).length);
  });
  add2(4, "g4-multiples", "Multiples", "4.OA.B.4", () => {
    let n = r2(2, 12), k = r2(3, 8);
    return q("What is the " + k + "th positive multiple of " + n + "?", n * k);
  }, "g4-mul");
  add2(4, "g4-pattern", "Number patterns", "4.OA.C.5", () => {
    let a = r2(1, 20), b = r2(2, 9);
    return q("Start at " + a + ". Add " + b + " each time. What is the fifth term (count " + a + " as term 1)?", a + 4 * b);
  });
  add2(4, "g4-place", "Whole-number place value", "4.NBT.A.1\u20132", () => {
    let n = r2(1e5, 999999), p = pick([10, 100, 1e3, 1e4, 1e5]);
    return q("In " + n + ", what is the value of the digit in the " + { 10: "tens", 100: "hundreds", 1e3: "thousands", 1e4: "ten-thousands", 1e5: "hundred-thousands" }[p] + " place?", Math.floor(n / p) % 10 * p);
  });
  add2(4, "g4-expand", "Expanded form to a number", "4.NBT.A.2", () => {
    let a = r2(1, 9), b = r2(1, 9), c = r2(1, 9);
    return calc2(a * 1e4 + " + " + b * 100 + " + " + c, a * 1e4 + b * 100 + c);
  });
  add2(4, "g4-compare", "Whole-number comparison", "4.NBT.A.2", () => comparison(r2(1e4, 999999), r2(1e4, 999999)));
  add2(4, "g4-round", "Whole-number rounding", "4.NBT.A.3", () => {
    let n = r2(1e3, 999999), p = pick([10, 100, 1e3]);
    return q("Round " + n + " to the nearest " + p + ". If halfway, round up.", Math.round(n / p) * p);
  });
  add2(4, "g4-add", "Whole-number addition", "4.NBT.B.4", () => {
    let a = r2(1e3, 499999), b = r2(1e3, 499999);
    return calc2(a + " + " + b, a + b);
  });
  add2(4, "g4-sub", "Whole-number subtraction", "4.NBT.B.4", () => {
    let a = r2(1e3, 999999), b = r2(1, a);
    return calc2(a + " \u2212 " + b, a - b);
  });
  add2(4, "g4-mul", "Whole-number multiplication", "4.NBT.B.5", () => {
    let a = r2(0, 1) ? r2(100, 9999) : r2(12, 99), b = a > 99 ? r2(2, 9) : r2(12, 99);
    return calc2(a + " \xD7 " + b, a * b);
  }, "g4-add");
  add2(4, "g4-div", "Whole-number division", "4.NBT.B.6", () => {
    let b = r2(2, 9), c = r2(12, 999);
    return calc2(b * c + " \xF7 " + b, c);
  }, "g4-mul");
  add2(4, "g4-remainder", "Division remainders", "4.NBT.B.6", () => {
    let b = r2(2, 9), c = r2(12, 999), m = r2(1, b - 1);
    return q("What is the remainder when " + (b * c + m) + " is divided by " + b + "?", m);
  }, "g4-div");
  add2(4, "g4-equivalent", "Reduce fractions", "4.NF.A.1", () => {
    let d = den(), a = r2(1, d - 1), m = r2(2, 6);
    return f("Reduce " + a * m + "/" + d * m + ".", a, d);
  });
  add2(4, "g4-missingfraction", "Equivalent fractions: missing numerator", "4.NF.A.1", () => {
    let d = den(), a = r2(1, d - 1), m = r2(2, 5);
    return q(a + "/" + d + " = x/" + d * m + ". Find x.", a * m);
  }, "g4-equivalent");
  add2(4, "g4-fcompare", "Compare fractions", "4.NF.A.2", () => {
    let d = den(), e = den();
    return comparison(r2(1, d) + "/" + d, r2(1, e) + "/" + e);
  }, "g4-equivalent");
  add2(4, "g4-fraction", "Add like-denominator fractions", "4.NF.B.3", () => {
    let d = den(), a = r2(1, d), b = r2(1, d);
    return f(a + "/" + d + " + " + b + "/" + d, a + b, d);
  });
  add2(4, "g4-fsub", "Subtract like-denominator fractions", "4.NF.B.3", () => {
    let d = den(), a = r2(2, d * 2), b = r2(1, a);
    return f(a + "/" + d + " \u2212 " + b + "/" + d, a - b, d);
  }, "g4-fraction");
  add2(4, "g4-mixed", "Mixed-number addition and subtraction", "4.NF.B.3", () => {
    let d = den(), a = r2(3, 8), b = r2(1, 2), n = r2(1, d - 1), m = r2(1, d - 1), sg = pick([1, -1]);
    return f(a + " " + n + "/" + d + (sg === 1 ? " + " : " \u2212 ") + b + " " + m + "/" + d, a * d + n + sg * (b * d + m), d);
  }, "g4-fsub");
  add2(4, "g4-fwhole", "Fraction \xD7 whole number", "4.NF.B.4", () => {
    let d = den(), a = r2(1, d - 1), b = r2(2, 12);
    return f(b + " \xD7 " + a + "/" + d, a * b, d);
  }, "g4-fraction");
  add2(4, "g4-fword", "Fraction word problems", "4.NF.B.3\u20134", () => {
    let d = den(), a = r2(1, d - 1), b = r2(2, 6);
    return f("Each ribbon uses " + a + "/" + d + " m. How many meters for " + b + " ribbons?", a * b, d);
  }, "g4-fwhole");
  add2(4, "g4-tenths", "Add tenths and hundredths", "4.NF.C.5", () => {
    let a = r2(1, 9), b = r2(1, 90);
    return f(a + "/10 + " + b + "/100", 10 * a + b, 100);
  }, "g4-fraction");
  add2(4, "g4-decimal", "Fractions to decimals", "4.NF.C.6", () => {
    let d = pick([10, 100]), a = r2(1, d * 3);
    return q("Write " + a + "/" + d + " as a decimal.", decimal(a, d), "decimal");
  });
  add2(4, "g4-dectofrac", "Decimals to reduced fractions", "4.NF.C.6", () => {
    let a = r2(1, 299);
    return f("Write " + decimal(a) + " as a reduced fraction.", a, 100);
  }, "g4-equivalent");
  add2(4, "g4-deccompare", "Compare decimals to hundredths", "4.NF.C.7", () => comparison(decimal(r2(1, 999)), decimal(r2(1, 999))));
  const units = [["m", "cm", 100], ["km", "m", 1e3], ["kg", "g", 1e3], ["L", "mL", 1e3], ["hours", "minutes", 60], ["minutes", "seconds", 60], ["feet", "inches", 12], ["yards", "feet", 3]];
  add2(4, "g4-convert", "Larger to smaller units", "4.MD.A.1", () => {
    let [a, b, k] = pick(units), n = r2(2, 20);
    return q(n + " " + a + " = how many " + b + "? (1 " + a + " = " + k + " " + b + ".)", n * k);
  }, "g4-mul");
  add2(4, "g4-measureword", "Unit and money word problems", "4.MD.A.2", () => {
    let a = r2(2, 9), b = r2(10, 90);
    return q("A rope is " + a + " m long. " + b + " cm is cut off. How many centimeters remain? (1 m = 100 cm.)", 100 * a - b);
  }, "g4-convert");
  add2(4, "g4-elapsed", "Elapsed time: duration", "4.MD.A.2", () => {
    let a = r2(300, 1e3), d = r2(15, 240);
    return q("A trip starts at " + ampm(a) + " and ends at " + ampm(a + d) + " the same day. How many minutes does it take?", d);
  });
  add2(4, "g4-timeforward", "Elapsed time: ending time", "4.MD.A.2", () => {
    let a = r2(300, 1100), d = r2(15, 240);
    return q("Start at " + ampm(a) + ". Work for " + d + " minutes. Enter the ending time as h:mm AM or PM.", ampm(a + d), "time12");
  }, "g4-elapsed");
  add2(4, "g4-timeback", "Elapsed time: starting time", "4.MD.A.2", () => {
    let a = r2(300, 1e3), d = r2(15, 240);
    return q("A " + d + "-minute trip ends at " + ampm(a + d) + ". Enter its starting time as h:mm AM or PM.", ampm(a), "time12");
  }, "g4-timeforward");
  add2(4, "g4-midnight", "Elapsed time across midnight", "4.MD.A.2", () => {
    let a = r2(1260, 1439), d = r2(1440 - a, 360);
    return q("Start at " + ampm(a) + " Monday; finish at " + ampm(a + d) + " Tuesday. How many minutes pass?", d);
  }, "g4-elapsed");
  add2(4, "g4-notation", "24-hour time: conversions and elapsed time", "4.MD.A.2 extension", () => {
    let a = r2(0, 1439), d = r2(15, 180), kind = r2(0, 3);
    if (kind === 0) return q("Write " + ampm(a) + " in 24-hour HH:MM notation.", clock2(a), "time");
    if (kind === 1) return q("In 24-hour time, start at " + clock2(a) + " and continue " + d + " minutes. Ending clock time? Enter HH:MM" + (a + d >= 1440 ? " (next day)." : "."), clock2(a + d), "time");
    if (kind === 2) return q("A " + d + "-minute activity ends at " + clock2(a + d) + " (24-hour time). Starting clock time? Enter HH:MM.", clock2(a), "time");
    return q("Start at " + clock2(a) + " and finish at " + clock2(a + d) + (a + d >= 1440 ? " the next day" : " the same day") + " (24-hour times). How many minutes pass?", d);
  });
  add2(4, "g4-timewords", "Quarter-hour time language", "4.MD.A.2 extension", () => {
    let h = r2(2, 10), m = pick([15, 30, 45]);
    return q("Write " + (m === 15 ? "quarter past " + h : m === 30 ? "half past " + h : "quarter to " + (h + 1)) + " in the morning as h:mm AM or PM.", ampm(h * 60 + m), "time12");
  });
  add2(4, "g4-timeunits", "Hours, minutes and seconds", "4.MD.A.1\u20132", () => {
    let h = r2(0, 3), m = r2(1, 59), s = r2(1, 59);
    return q(h + " hours " + m + " minutes " + s + " seconds equals how many seconds? (1 hour = 60 minutes; 1 minute = 60 seconds.)", h * 3600 + m * 60 + s);
  }, "g4-convert");
  add2(4, "g4-timejourney", "Multistep journeys and deadlines", "4.MD.A.2", () => {
    let a = r2(400, 900), b = r2(15, 70), c = r2(5, 25), d = r2(15, 70), back = r2(0, 1);
    return q("A journey takes " + b + " minutes, a " + c + "-minute stop, then " + d + " more minutes. " + (back ? "To finish at " + ampm(a + b + c + d) + ", when must it start?" : "Starting at " + ampm(a) + ", when does it finish?") + " Enter h:mm AM or PM.", ampm(back ? a : a + b + c + d), "time12");
  }, "g4-timeback");
  add2(4, "g4-timewait", "Schedules, waiting and transfers", "4.MD.A.2", () => {
    let a = r2(400, 1e3), b = r2(5, 20), wait = r2(1, 35);
    return q("Arrive at " + ampm(a) + ". Walk " + b + " minutes to the bus stop. The bus leaves at " + ampm(a + b + wait) + ". After the walk, how many minutes remain before departure?", wait);
  }, "g4-elapsed");
  add2(4, "g4-timecompare", "Compare trip durations", "4.MD.A.2", () => {
    let a = r2(400, 700), b = r2(800, 1e3), c = r2(20, 120), d = r2(20, 120);
    return q("Trip A: " + ampm(a) + " to " + ampm(a + c) + ". Trip B: " + ampm(b) + " to " + ampm(b + d) + ". Both are same-day AM/PM times. How many minutes longer is the longer trip? Enter 0 if equal.", Math.abs(c - d));
  }, "g4-elapsed");
  add2(4, "g4-timebudget", "Repeated durations and time budgets", "4.MD.A.2", () => {
    let setup = r2(5, 20), n = r2(3, 8), cycle = r2(4, 15), left = r2(0, 30), total = setup + n * cycle + left;
    return q("You have " + total + " minutes. Setup takes " + setup + " minutes, then " + n + " cycles take " + cycle + " minutes each. How many minutes remain?", left);
  }, "g4-multistep");
  add2(5, "g5-order", "Order of operations: parentheses, no exponents", "5.OA.A.1", () => {
    let a = r2(2, 12), b = r2(2, 9), c = r2(2, 9), d = r2(1, 9);
    return r2(0, 1) ? calc2("(" + a + " + " + b + ") \xD7 " + c + " \u2212 " + d * c + " \xF7 " + c, (a + b) * c - d) : calc2(a * b + " \xF7 " + b + " \xD7 " + c + " + (" + d + " \u2212 1)", a * c + d - 1);
  }, "g4-multistep");
  add2(5, "g5-write", "Write numerical expressions", "5.OA.A.2", () => {
    let a = r2(2, 12), b = r2(2, 9), c = r2(2, 9);
    return q("Write an expression for " + c + " times the sum of " + a + " and " + b + ". Do not give only the result.", c + "*(" + a + "+" + b + ")", "expression");
  }, "g5-order");
  add2(5, "g5-pattern", "Related numerical patterns", "5.OA.B.3 textual component", () => {
    let a = r2(2, 6), b = r2(7, 12), n = r2(3, 9);
    return q("Two patterns start at 0. A adds " + a + " each step; B adds " + b + ". After " + n + " steps, how much greater is B than A?", (b - a) * n);
  }, "g4-pattern");
  add2(5, "g5-place", "Decimal place value", "5.NBT.A.1,3", () => {
    let a = r2(1001, 9999), p = pick([10, 100, 1e3]);
    return q("In " + decimal(a, 1e3) + ", what is the value of the " + { 10: "tenths", 100: "hundredths", 1e3: "thousandths" }[p] + " digit?", Math.floor(a / (1e3 / p)) % 10 / p);
  });
  add2(5, "g5-powers10", "Powers of ten and decimal shifts", "5.NBT.A.2", () => {
    let a = r2(1, 9999), n = r2(1, 3), div = r2(0, 1);
    return calc2(decimal(a) + " " + (div ? "\xF7" : "\xD7") + " 10^" + n, div ? a / 100 / 10 ** n : a / 100 * 10 ** n);
  }, "g4-decimal");
  add2(5, "g5-deccompare", "Compare decimals to thousandths", "5.NBT.A.3", () => comparison(decimal(r2(1, 9999), 1e3), decimal(r2(1, 9999), 1e3)), "g4-deccompare");
  add2(5, "g5-round", "Round decimals", "5.NBT.A.4", () => {
    let a = r2(1, 99999), p = pick([1, 10, 100]), step = 1e3 / p;
    return q("Round " + decimal(a, 1e3) + " to the nearest " + { 1: "whole number", 10: "tenth", 100: "hundredth" }[p] + ". If halfway, round up.", Math.floor((a + step / 2) / step) / p);
  }, "g4-round");
  add2(5, "g5-mul", "Multi-digit multiplication", "5.NBT.B.5", () => {
    let a = r2(100, 999), b = r2(12, 999);
    return calc2(a + " \xD7 " + b, a * b);
  }, "g4-mul");
  add2(5, "g5-div", "Two-digit divisor division", "5.NBT.B.6", () => {
    let b = r2(12, 99), a = r2(12, 99);
    return calc2(a * b + " \xF7 " + b, a);
  }, "g4-div");
  for (const [id, name, op] of [["decadd", "addition", "+"], ["decsub", "subtraction", "\u2212"], ["decmul", "multiplication", "\xD7"], ["decdiv", "division", "\xF7"]]) add2(5, "g5-" + id, "Decimal " + name, "5.NBT.B.7", () => {
    let a = r2(100, 999), b = r2(10, 99);
    if (op === "\xF7") return calc2(decimal(a * b, 1e3) + " \xF7 " + decimal(b, 10), a / 100);
    return calc2(decimal(a) + " " + op + " " + decimal(b), op === "+" ? (a + b) / 100 : op === "\u2212" ? (a - b) / 100 : a * b / 1e4);
  }, "g4-" + (op === "+" ? "add" : op === "\u2212" ? "sub" : op === "\xD7" ? "mul" : "div"));
  add2(5, "g5-fadd", "Unlike-denominator fraction addition", "5.NF.A.1", () => {
    let d = den(), e = pick([2, 3, 4, 5, 6, 8, 10, 12].filter((v) => v !== d)), a = r2(1, d), b = r2(1, e);
    return f(a + "/" + d + " + " + b + "/" + e, a * e + b * d, d * e);
  }, "g4-fraction");
  add2(5, "g5-fsub", "Unlike-denominator fraction subtraction", "5.NF.A.1", () => {
    let d = den(), e = pick([2, 3, 4, 5, 6, 8, 10, 12].filter((v) => v !== d)), a = r2(1, d), b = r2(1, e);
    if (a * e < b * d) [a, b, d, e] = [b, a, e, d];
    return f(a + "/" + d + " \u2212 " + b + "/" + e, a * e - b * d, d * e);
  }, "g4-fsub");
  add2(5, "g5-mixed", "Mixed numbers with unlike denominators", "5.NF.A.1", () => {
    let d = den(), e = den(), a = r2(3, 7), b = r2(1, 2), n = r2(1, d - 1), m = r2(1, e - 1), sg = pick([1, -1]);
    return f(a + " " + n + "/" + d + (sg === 1 ? " + " : " \u2212 ") + b + " " + m + "/" + e, (a * d + n) * e + sg * (b * e + m) * d, d * e);
  }, "g5-fadd");
  add2(5, "g5-fword", "Fraction addition/subtraction word problems", "5.NF.A.2", () => {
    let d = den(), e = den();
    return f("A jug holds 1/" + d + " L. You add 1/" + e + " L. How many liters now?", d + e, d * e);
  }, "g5-fadd");
  add2(5, "g5-quotient", "Fractions as quotients", "5.NF.B.3", () => {
    let a = r2(2, 12), b = r2(2, 12);
    return f(a + " loaves are shared equally by " + b + " people. How many loaves per person?", a, b);
  }, "g4-equivalent");
  add2(5, "g5-fmul", "Fraction multiplication", "5.NF.B.4", () => {
    let d = den(), e = den(), a = r2(1, d + 2), b = r2(1, e + 2);
    return f(a + "/" + d + " \xD7 " + b + "/" + e, a * b, d * e);
  }, "g4-fwhole");
  add2(5, "g5-scale", "Multiplication as scaling", "5.NF.B.5", () => {
    let a = r2(3, 20), n = r2(1, 12), d = den();
    return q("Compare " + a + " \xD7 " + n + "/" + d + " with " + a + ". Enter <, > or =.", cmp(n, d), "comparison");
  }, "g5-fmul");
  add2(5, "g5-fmulword", "Fraction multiplication word problems", "5.NF.B.6", () => {
    let d = den(), a = r2(1, d - 1), b = r2(2, 12);
    return f("You use " + a + "/" + d + " of " + b + " kg of flour. How many kilograms do you use?", a * b, d);
  }, "g5-fmul");
  add2(5, "g5-divfrac", "Whole number \xF7 unit fraction", "5.NF.B.7", () => {
    let a = r2(2, 12), b = den();
    return calc2(a + " \xF7 (1/" + b + ")", a * b);
  }, "g4-mul");
  add2(5, "g5-unitdiv", "Unit fraction \xF7 whole number", "5.NF.B.7", () => {
    let a = r2(2, 12), b = den();
    return f("(1/" + b + ") \xF7 " + a, 1, a * b);
  }, "g5-fmul");
  add2(5, "g5-divword", "Unit-fraction division word problems", "5.NF.B.7", () => {
    let a = r2(2, 12), b = den();
    return q(a + " L of juice fills cups holding 1/" + b + " L each. How many cups?", a * b);
  }, "g5-divfrac");
  add2(5, "g5-convert", "Conversions in both directions", "5.MD.A.1", () => {
    let [a, b, k] = pick(units), n = r2(1, 100), div = r2(0, 1);
    return q(n + " " + (div ? b : a) + " = how many " + (div ? a : b) + "? (1 " + a + " = " + k + " " + b + ".) Give an exact value; fractions are allowed.", div ? frac(n, k) : n * k);
  }, "g4-convert");
  add2(5, "g5-word", "Decimal money word problems", "5.NBT.B.7", () => {
    let p = r2(125, 499), n = r2(2, 5);
    return q(n + " notebooks cost $" + decimal(p) + " each. Total cost in dollars?", p * n / 100);
  }, "g5-decmul");
  add2(6, "g6-ratio", "Equivalent ratios: missing value", "6.RP.A.1,3", () => {
    let a = r2(2, 9), b = r2(2, 9), m = r2(2, 8);
    return q("Red:blue = " + a + ":" + b + ". If there are " + a * m + " red beads, how many blue beads?", b * m);
  }, "g4-mul");
  add2(6, "g6-rate", "Unit rates", "6.RP.A.2", () => {
    let n = r2(2, 9), v = r2(3, 15);
    return q(n + " kg costs $" + n * v + ". What is the cost in dollars per kg?", v);
  }, "g4-div");
  add2(6, "g6-ratecompare", "Compare unit costs", "6.RP.A.3", () => {
    let n = r2(2, 9), m = r2(2, 9), a = r2(2, 12), b = r2(2, 12);
    return q("Pack A: " + n + " pens for $" + n * a + ". Pack B: " + m + " pens for $" + m * b + ". Compare cost per pen: A ___ B. Enter <, > or =.", cmp(a, b), "comparison");
  }, "g6-rate");
  add2(6, "g6-percent", "Percent of a quantity", "6.RP.A.3", () => {
    let p = r2(1, 99), n = r2(1, 20) * 100;
    return calc2(p + "% of " + n, p * n / 100);
  }, "g5-fmul");
  add2(6, "g6-percentwhole", "Find the whole from a percent", "6.RP.A.3", () => {
    let p = r2(1, 19) * 5, n = r2(1, 20) * 100;
    return q(p + "% of a number is " + p * n / 100 + ". Find the number.", n);
  }, "g6-percent");
  add2(6, "g6-percentrate", "Find the percentage", "6.RP.A.3", () => {
    let p = r2(1, 99), n = r2(1, 10) * 100;
    return q(p * n / 100 + " is what percent of " + n + "? Enter the number without %.", p);
  }, "g6-percent");
  add2(6, "g6-represent", "Fraction, decimal and percent conversions", "6.RP.A.3", () => {
    let a = r2(1, 99), v = r2(0, 2);
    return v === 0 ? f("Write " + a + "% as a fraction.", a, 100) : v === 1 ? q("Write " + a + "% as a decimal.", a / 100, "decimal") : q("Write " + decimal(a) + " as a percent. Enter the number without %.", a);
  }, "g4-dectofrac");
  add2(6, "g6-convert", "Ratio-based unit conversions", "6.RP.A.3", () => {
    let k = pick([2.54, 1.6]), n = r2(2, 25);
    return q(n + " " + (k === 2.54 ? "inches" : "miles") + " = how many " + (k === 2.54 ? "centimeters" : "kilometers") + "? Use 1 " + (k === 2.54 ? "inch = 2.54 cm" : "mile = 1.6 km") + ".", Number((n * k).toFixed(2)));
  }, "g5-decmul");
  add2(6, "g6-word", "Ratio word problems", "6.RP.A.3", () => {
    let a = r2(2, 5), b = r2(6, 9), m = r2(2, 8);
    return q("A recipe uses " + a + " cups of flour for " + b + " servings. Cups for " + b * m + " servings?", a * m);
  }, "g6-rate");
  add2(6, "g6-fdiv", "Fraction division", "6.NS.A.1", () => {
    let a = r2(1, 9), b = den(), c = r2(1, 9), d = den();
    return f("(" + a + "/" + b + ") \xF7 (" + c + "/" + d + ")", a * d, b * c);
  }, "g5-fmul");
  add2(6, "g6-fdivword", "Fraction division word problems", "6.NS.A.1", () => {
    let a = r2(2, 9), b = den(), c = r2(1, 5), d = den();
    return f("A machine uses " + c + "/" + d + " L each hour. How many hours will " + a + "/" + b + " L last?", a * d, b * c);
  }, "g6-fdiv");
  add2(6, "g6-longdiv", "Multi-digit division", "6.NS.B.2", () => {
    let b = r2(12, 199), a = r2(12, 199);
    return calc2(a * b + " \xF7 " + b, a);
  }, "g5-div");
  add2(6, "g6-decops", "Decimal operations fluency", "6.NS.B.3", () => {
    let a = r2(101, 9999), b = r2(11, 99), op = pick(["+", "\u2212", "\xD7", "\xF7"]);
    return op === "\xF7" ? calc2(decimal(a * b, 1e4) + " \xF7 " + decimal(b), a / 100) : calc2(decimal(a, 1e3) + " " + op + " " + decimal(b), op === "+" ? (a + 10 * b) / 1e3 : op === "\u2212" ? (a - 10 * b) / 1e3 : a * b / 1e5);
  }, "g5-decdiv");
  add2(6, "g6-gcf", "Greatest common factor", "6.NS.B.4", () => {
    let a = r2(2, 100), b = r2(2, 100);
    return q("Find the greatest common factor of " + a + " and " + b + ".", gcd(a, b));
  }, "g4-factors");
  add2(6, "g6-lcm", "Least common multiple", "6.NS.B.4", () => {
    let a = r2(2, 12), b = r2(2, 12);
    return q("Find the least common multiple of " + a + " and " + b + ".", a * b / gcd(a, b));
  }, "g4-multiples");
  add2(6, "g6-negative", "Signed quantities and opposites", "6.NS.C.5\u20136", () => {
    let n = r2(1, 50);
    return r2(0, 1) ? q("A bank balance is " + n + " dollars below zero. Write the signed balance.", -n) : q("What is the opposite of " + -n + "?", n);
  });
  add2(6, "g6-compare", "Compare signed rational numbers", "6.NS.C.7", () => comparison(frac(r2(-20, 20), den()), frac(r2(-20, 20), den())), "g4-fcompare");
  add2(6, "g6-absolute", "Absolute value", "6.NS.C.7", () => {
    let n = r2(-100, 100);
    return calc2("|" + n + "|", Math.abs(n));
  }, "g6-negative");
  add2(6, "g6-exponents", "Whole-number exponents", "6.EE.A.1", () => {
    let a = r2(2, 9), b = r2(2, 4);
    return calc2(a + "^" + b, a ** b);
  }, "g4-mul");
  add2(6, "g6-order", "Order of operations: parentheses and exponents", "6.EE.A.1", () => {
    let a = r2(2, 7), b = r2(2, 4), c = r2(2, 6), d = r2(2, 9), e = r2(1, 9);
    return r2(0, 1) ? calc2("(" + a + " + " + b + ")^2 \u2212 " + c * d + " \xF7 " + c + " + " + e + " \xD7 2", (a + b) ** 2 - d + e * 2) : calc2(a * d + " \xF7 " + d + " \xD7 " + c + " + (" + b + " + " + e + ")^2", a * c + (b + e) ** 2);
  }, "g5-order");
  add2(6, "g6-eval", "Evaluate expressions", "6.EE.A.2", () => {
    let a = r2(2, 9), x = r2(2, 12), b = r2(1, 15);
    return q("Evaluate " + a + "x + " + b + " when x = " + x + ".", a * x + b);
  }, "g5-order");
  add2(6, "g6-terms", "Coefficients and terms", "6.EE.A.2", () => {
    let a = r2(2, 12), b = r2(1, 20);
    return q("In " + a + "x + " + b + ", what is the coefficient of x?", a);
  });
  add2(6, "g6-write", "Write algebraic expressions", "6.EE.A.2", () => {
    let a = r2(2, 9), b = r2(1, 20);
    return q("Write an expression: " + b + " more than " + a + " times x.", a + "x+" + b, "expression");
  }, "g6-eval");
  add2(6, "g6-distribute", "Distributive property", "6.EE.A.3\u20134", () => {
    let a = r2(2, 9), b = r2(1, 12);
    return q("Expand " + a + "(x + " + b + "). Give the expression without parentheses.", a + "x+" + a * b, "expanded");
  }, "g6-write");
  add2(6, "g6-combine", "Combine like terms", "6.EE.A.3\u20134", () => {
    let a = r2(2, 9), b = r2(2, 9), c = r2(1, 12);
    return q("Simplify " + a + "x + " + b + "x + " + c + ". Write ax + b form.", a + b + "x+" + c, "linear");
  }, "g6-write");
  add2(6, "g6-eq", "One-step equations", "6.EE.B.5,7", () => {
    let x = r2(1, 30), b = r2(2, 20), k = r2(0, 3);
    return q("Solve " + ["x + " + b + " = " + (x + b), "x \u2212 " + b + " = " + (x - b), b + "x = " + b * x, "x \xF7 " + b + " = " + frac(x, b)][k] + ". Enter x.", x);
  }, "g4-sub");
  add2(6, "g6-eqword", "One-step equation word problems", "6.EE.B.6\u20137", () => {
    let x = r2(3, 20), b = r2(2, 9);
    return q(b + " equal-price tickets cost $" + b * x + ". What is one ticket price in dollars?", x);
  }, "g6-eq");
  add2(6, "g6-inequality", "Write one-variable inequalities", "6.EE.B.8", () => {
    let a = r2(2, 30), greater = r2(0, 1);
    return q("Write an inequality: x is " + (greater ? "greater" : "less") + " than " + a + ".", "x" + (greater ? ">" : "<") + a, "inequality");
  });
  add2(6, "g6-relation", "Dependent quantities from a rule", "6.EE.C.9 textual component", () => {
    let a = r2(2, 12), b = r2(1, 10), x = r2(2, 20);
    return q("Cost y is " + a + "x + " + b + " dollars for x rides. Find y for " + x + " rides.", a * x + b);
  }, "g6-eval");
  add2(7, "g7-fracrate", "Unit rates with fractions", "7.RP.A.1", () => {
    let a = r2(1, 9), b = den(), c = r2(1, 9), d = den();
    return f("Travel " + a + "/" + b + " km in " + c + "/" + d + " hour. What is the speed in km per hour?", a * d, b * c);
  }, "g6-fdiv");
  add2(7, "g7-proportion", "Proportional constants", "7.RP.A.2", () => {
    let k = r2(2, 20), x = r2(2, 10);
    return q("y is proportional to x. When x = " + x + ", y = " + x * k + ". Find k in y = kx.", k);
  }, "g6-rate");
  add2(7, "g7-propequation", "Write proportional equations", "7.RP.A.2", () => {
    let k = r2(2, 12);
    return q("An item costs $" + k + ". Write the cost of x items as an expression in x.", k + "x", "expression");
  }, "g6-write");
  add2(7, "g7-propword", "Proportion word problems", "7.RP.A.2\u20133", () => {
    let a = r2(2, 9), b = r2(2, 15), c = r2(2, 12);
    return q(a + " tickets cost $" + a * b + ". At that rate, what do " + c + " tickets cost in dollars?", b * c);
  }, "g7-proportion");
  add2(7, "g7-discount", "Percent decrease", "7.RP.A.3", () => {
    let p = r2(1, 8) * 5, n = r2(2, 40) * 10;
    return q("A $" + n + " item has a " + p + "% discount. Sale price in dollars?", n * (100 - p) / 100);
  }, "g6-percent");
  add2(7, "g7-increase", "Tax, tips and markup", "7.RP.A.3", () => {
    let p = r2(1, 20), n = r2(2, 40) * 10;
    return q("A $" + n + " bill has " + p + "% " + pick(["tax", "tip"]) + " added. Total in dollars?", n * (100 + p) / 100);
  }, "g6-percent");
  add2(7, "g7-change", "Percent change", "7.RP.A.3", () => {
    let n = r2(1, 20) * 100, p = r2(1, 50), sg = pick([1, -1]);
    return q("A price changes from $" + n + " to $" + n * (100 + sg * p) / 100 + ". What is the percent " + (sg > 0 ? "increase" : "decrease") + "? Enter the number without %.", p);
  }, "g6-percentrate");
  add2(7, "g7-interest", "Simple interest", "7.RP.A.3", () => {
    let p = r2(1, 20) * 100, rate = r2(1, 9), t = r2(1, 5);
    return q("$" + p + " earns simple interest at " + rate + "% per year for " + t + " years. How many dollars of interest (not total balance)?", p * rate * t / 100);
  }, "g6-percent");
  add2(7, "g7-percentmulti", "Successive percent changes", "7.RP.A.3", () => {
    let n = r2(1, 20) * 100, p = r2(1, 5) * 5, t = r2(1, 10);
    return q("A $" + n + " item is discounted " + p + "%, then " + t + "% tax is added to the discounted price. Final dollars? Round to the nearest cent only at the end (half up).", Math.round(n * (100 - p) * (100 + t) / 100) / 100);
  }, "g7-discount");
  add2(7, "g7-percenterror", "Percent error", "7.RP.A.3", () => {
    let n = r2(1, 10) * 100, p = r2(1, 30);
    return q("Actual length is " + n + " cm; an estimate is " + (n + n * p / 100) + " cm. What is the percent error? Enter the number without %.", p);
  }, "g6-percentrate");
  for (const [id, name, op] of [["intadd", "addition", "+"], ["intsub", "subtraction", "\u2212"], ["intmul", "multiplication", "\xD7"], ["intdiv", "division", "\xF7"]]) add2(7, "g7-" + id, "Signed-number " + name, "7.NS.A.1\u20132", () => {
    let a = r2(-30, 30), b = pick([-12, -9, -6, -3, 2, 4, 7, 10]);
    return op === "\xF7" ? calc2(a * b + " \xF7 (" + b + ")", a) : calc2(a + " " + op + " (" + b + ")", op === "+" ? a + b : op === "\u2212" ? a - b : a * b);
  }, op === "+" || op === "\u2212" ? "g6-negative" : "g4-mul");
  add2(7, "g7-rational", "Signed fraction operations", "7.NS.A.1\u20132", () => {
    let a = r2(-12, 12), b = den(), c = pick([-9, -7, -4, -1, 2, 3, 6, 8]), d = den(), op = pick(["+", "\u2212", "\xD7", "\xF7"]);
    return f("(" + frac(a, b) + ") " + op + " (" + frac(c, d) + ")", op === "+" ? a * d + c * b : op === "\u2212" ? a * d - c * b : op === "\xD7" ? a * c : a * d, op === "\xF7" ? b * c : b * d);
  }, "g6-fdiv");
  add2(7, "g7-signeddec", "Signed decimal operations", "7.NS.A.1\u20132", () => {
    let a = r2(-999, 999), b = pick([-12, -5, -2, 3, 7, 11]), op = pick(["+", "\u2212", "\xD7", "\xF7"]);
    return op === "\xF7" ? calc2(decimal(a * b) + " \xF7 (" + b + ")", a / 100) : calc2(decimal(a) + " " + op + " (" + decimal(b, 10) + ")", op === "+" ? (a + 10 * b) / 100 : op === "\u2212" ? (a - 10 * b) / 100 : a * b / 1e3);
  }, "g7-intadd");
  add2(7, "g7-decimal", "Rational numbers as decimals", "7.NS.A.2", () => {
    let d = pick([2, 4, 5, 8, 10, 20, 25]), n = r2(-30, 30);
    return q("Write " + n + "/" + d + " as a decimal.", n / d, "decimal");
  }, "g4-decimal");
  add2(7, "g7-repeat", "Repeating decimal notation", "7.NS.A.2", () => {
    let n = pick([1, 2, 4, 5, 7, 8]);
    return q("Write " + n + "/9 as a repeating decimal. Put the repeating digit in parentheses, such as 0.(3).", "0.(" + n + ")", "repeating");
  }, "g7-decimal");
  add2(7, "g7-word", "Signed-change word problems", "7.NS.A.3", () => {
    let a = r2(-15, 5), b = r2(1, 20), sg = pick([1, -1]);
    return q("Temperature is " + a + "\xB0C. It " + (sg > 0 ? "rises" : "falls") + " " + b + "\xB0C. New temperature in \xB0C?", a + sg * b);
  }, "g7-intadd");
  add2(7, "g7-rationalword", "Multistep rational-number word problems", "7.NS.A.3", () => {
    let a = r2(-200, 200), b = r2(10, 90), n = r2(2, 5);
    return q("Your account balance is $" + a + ". You make " + n + " purchases of $" + decimal(b, 10) + " each. What is the signed new balance in dollars?", a - n * b / 10);
  }, "g7-signeddec");
  add2(7, "g7-expression", "Combine signed rational like terms", "7.EE.A.1", () => {
    let a = r2(-9, -1), b = r2(2, 12), c = r2(-10, 10);
    return q("Simplify " + a + "x + " + b + "x + (" + c + "). Write ax + b form.", a + b + "x" + (c >= 0 ? "+" : "") + c, "linear");
  }, "g6-combine");
  add2(7, "g7-distribute", "Expand signed expressions", "7.EE.A.1", () => {
    let a = r2(-9, -2), b = r2(1, 12);
    return q("Expand " + a + "(x \u2212 " + b + "). Give the expression without parentheses.", a + "x+" + -a * b, "expanded");
  }, "g6-distribute");
  add2(7, "g7-factor", "Factor linear expressions", "7.EE.A.1", () => {
    let a = r2(2, 9), b = r2(1, 9);
    return q("Factor " + a + "x + " + a * b + " completely using the greatest positive integer common factor.", a + "*(x+" + b + ")", "factored");
  }, "g6-gcf");
  add2(7, "g7-rewrite", "Rewrite percent expressions", "7.EE.A.2", () => {
    let p = r2(1, 40);
    return q("A price x increases by " + p + "%. Write the new price as one number multiplied by x.", decimal(100 + p) + "x", "linear");
  }, "g7-increase");
  add2(7, "g7-eval", "Evaluate signed rational expressions", "7.EE.A.1\u20132", () => {
    let x = r2(-9, -1), a = r2(2, 5), b = r2(-10, 10);
    return q("Evaluate " + a + "x^2 + (" + b + ") when x = " + x + ".", a * x * x + b);
  }, "g6-order");
  add2(7, "g7-eq", "Two-step equations", "7.EE.B.4", () => {
    let a = pick([-9, -5, -2, 2, 4, 7]), b = r2(-20, 20), x = r2(-10, 10);
    return q("Solve " + a + "x + (" + b + ") = " + (a * x + b) + ". Enter x.", x);
  }, "g6-eq");
  add2(7, "g7-eqgroup", "Equations with parentheses", "7.EE.B.4", () => {
    let a = pick([-6, -3, 2, 5]), b = r2(-9, 9), x = r2(-10, 10);
    return q("Solve " + a + "(x + (" + b + ")) = " + a * (x + b) + ". Enter x.", x);
  }, "g7-eq");
  add2(7, "g7-eqfrac", "Equations with rational coefficients", "7.EE.B.4", () => {
    let a = r2(2, 9), b = r2(1, 10), x = r2(-10, 10) * a;
    return q("Solve x/" + a + " + " + b + " = " + (x / a + b) + ". Enter x.", x);
  }, "g7-eq");
  add2(7, "g7-eqword", "Two-step equation word problems", "7.EE.B.3\u20134", () => {
    let a = r2(2, 9), b = r2(5, 30), x = r2(2, 12);
    return q("A rental costs $" + b + " plus $" + a + " per hour. Total is $" + (b + a * x) + ". How many hours?", x);
  }, "g7-eq");
  add2(7, "g7-inequality", "Solve two-step inequalities", "7.EE.B.4", () => {
    let a = pick([-5, -3, 2, 4]), b = r2(-10, 10), x = r2(-10, 10), op = pick(["<", ">", "\u2264", "\u2265"]), flip = { "<": ">", ">": "<", "\u2264": "\u2265", "\u2265": "\u2264" };
    return q("Solve " + a + "x + (" + b + ") " + op + " " + (a * x + b) + ". Give the solution as an inequality in x.", "x" + (a < 0 ? flip[op] : op) + x, "inequality");
  }, "g7-eq");
  add2(7, "g7-ineqword", "Inequality word problems", "7.EE.B.4", () => {
    let a = r2(2, 8), b = r2(5, 20), x = r2(3, 12);
    return q("You have $" + (a * x + b) + ". A fee is $" + b + " plus $" + a + " per ride. What is the greatest whole number of rides you can afford?", x);
  }, "g7-inequality");
  add2(7, "g7-rationalcoeff", "Simplify rational-coefficient expressions", "7.EE.A.1", () => {
    let a = r2(-9, 9), b = r2(1, 9), c = r2(-9, 9);
    return q("Simplify " + decimal(a, 10) + "x + " + decimal(b, 10) + "x + (" + decimal(c, 10) + "). Write ax + b form.", decimal(a + b, 10) + "x" + (c >= 0 ? "+" : "") + decimal(c, 10), "linear");
  }, "g7-expression");
  add2(7, "g7-fraceq", "Equations with fractional coefficients", "7.EE.B.4", () => {
    let a = r2(2, 7), b = den(), x = r2(-6, 6) * b, c = r2(-9, 9);
    return q("Solve (" + frac(a, b) + ")x + (" + c + ") = " + (a * x / b + c) + ". Enter x.", x);
  }, "g7-eqfrac");
  add2(6, "g6-ordering", "Order rational numbers without a number line", "6.NS.C.7", () => {
    let a = frac(r2(-20, 20), den()), b = frac(r2(-20, 20), den()), c = decimal(r2(-99, 99), 10);
    return q("What is the least of " + a + ", " + b + " and " + c + "? Give an exact value.", [a, b, c].sort((x, y) => value(x) - value(y))[0]);
  }, "g6-compare");
  add2(4, "g4-unitfraction", "Fraction decomposition into unit fractions", "4.NF.B.3", () => {
    let d = den(), n = r2(2, 12);
    return q("How many copies of 1/" + d + " make " + n + "/" + d + "?", n);
  }, "g4-fraction");
  add2(5, "g5-festimate", "Estimate fraction sums", "5.NF.A.2", () => {
    let d = den(), e = den(), a = r2(1, d - 1), b = r2(1, e - 1);
    return q("Estimate " + a + "/" + d + " + " + b + "/" + e + " by rounding EACH fraction to the nearest whole number first (half up). Enter the estimated sum.", Math.round(a / d) + Math.round(b / e));
  }, "g5-fadd");
  add2(4, "g4-timedeadline", "Time limits and latest departures", "4.MD.A.2", () => {
    let end = r2(600, 1100), walk = r2(5, 20), ride = r2(20, 80);
    return q("You must arrive by " + ampm(end) + ". Walking takes " + walk + " minutes and the bus trip takes " + ride + " minutes, with no wait. What is the latest starting time? Enter h:mm AM or PM.", ampm(end - walk - ride), "time12");
  }, "g4-timeback");
  add2(4, "g4-midnightend", "Ending times across midnight", "4.MD.A.2", () => {
    let start = r2(1320, 1439), d = r2(1440 - start, 300);
    return q("Start at " + ampm(start) + " Monday. Continue for " + d + " minutes. What time on Tuesday do you finish? Enter h:mm AM or PM.", ampm(start + d), "time12");
  }, "g4-timeforward");
  list.find((s) => s.id === "g4-notation").optional24 = true;
  for (const [id, pre] of Object.entries({ "g4-add": "g3-add", "g4-sub": "g3-sub", "g4-div": "g3-div", "g4-equivalent": "g3-reduce", "g4-elapsed": "g3-time-addsubtract" })) list.find((s) => s.id === id).prereq = pre;
  list.sort((a, b) => a.grade - b.grade);
  function value(s) {
    s = String(s).trim().replace(/−/g, "-");
    let m = s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);
    if (m) return +m[4] ? (m[1] ? -1 : 1) * (+m[2] + m[3] / m[4]) : NaN;
    m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (m) return +m[2] ? m[1] / m[2] : NaN;
    return /^-?(\d+(\.\d*)?|\.\d+)$/.test(s) ? Number(s) : NaN;
  }
  function polynomial(text) {
    const s = String(text).toLowerCase().replace(/−/g, "-").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/\s+/g, "");
    if (!s || s.length > 100) return null;
    const raw = s.match(/\d*\.\d+|\d+|[x()+*/^\-]/g);
    if (!raw || raw.join("") !== s) return null;
    const ts = [];
    for (const t of raw) {
      let last = ts.at(-1);
      if (last && (last === "x" || last === ")" || /^\d|^\./.test(last)) && (t === "x" || t === "(")) ts.push("*");
      ts.push(t);
    }
    let i = 0;
    const trim = (a) => {
      while (a.length > 1 && Math.abs(a.at(-1)) < 1e-10) a.pop();
      return a;
    };
    const sum = (a, b, sg = 1) => trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i2) => (a[i2] || 0) + sg * (b[i2] || 0)));
    const mul = (a, b) => {
      if (a.length + b.length > 10) throw Error();
      let c = Array(a.length + b.length - 1).fill(0);
      a.forEach((x, i2) => b.forEach((y, j) => c[i2 + j] += x * y));
      return trim(c);
    };
    function atom() {
      const t = ts[i++];
      if (t === "(") {
        const a = expr();
        if (ts[i++] !== ")") throw Error();
        return a;
      }
      if (t === "x") return [0, 1];
      if (t && /^\d|^\./.test(t)) return [+t];
      throw Error();
    }
    function power() {
      let a = atom();
      if (ts[i] === "^") {
        i++;
        const n = ts[i++];
        if (!/^[0-5]$/.test(n)) throw Error();
        const b = a;
        a = [1];
        for (let k = 0; k < +n; k++) a = mul(a, b);
      }
      return a;
    }
    function unary() {
      if (ts[i] === "+") {
        i++;
        return unary();
      }
      if (ts[i] === "-") {
        i++;
        return unary().map((x) => -x);
      }
      return power();
    }
    function term() {
      let a = unary();
      while (ts[i] === "*" || ts[i] === "/") {
        const op = ts[i++], b = unary();
        if (op === "*") a = mul(a, b);
        else {
          if (b.length !== 1 || !b[0]) throw Error();
          a = a.map((x) => x / b[0]);
        }
      }
      return a;
    }
    function expr() {
      let a = term();
      while (ts[i] === "+" || ts[i] === "-") {
        const op = ts[i++];
        a = sum(a, term(), op === "+" ? 1 : -1);
      }
      return a;
    }
    try {
      const a = trim(expr());
      return i === ts.length && a.every(Number.isFinite) ? a : null;
    } catch {
      return null;
    }
  }
  function inequality(s) {
    s = String(s).replace(/\s+/g, "").replace(/−/g, "-").replace(/<=/g, "\u2264").replace(/>=/g, "\u2265");
    let m = s.match(/^x([<>≤≥])(-?(?:\d+(?:\.\d+)?|\d+\/\d+))$/);
    if (!m) {
      m = s.match(/^(-?(?:\d+(?:\.\d+)?|\d+\/\d+))([<>≤≥])x$/);
      if (!m) return null;
      return [{ "<": ">", ">": "<", "\u2264": "\u2265", "\u2265": "\u2264" }[m[2]], value(m[1])];
    }
    return [m[1], value(m[2])];
  }
  function check(item2, s) {
    s = String(s).trim().replace(/−/g, "-");
    if (!s || s.length > 100) return false;
    if (item2.type === "comparison") return s === item2.answer;
    if (item2.type === "time12") {
      const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      return !!m && +m[1] >= 1 && +m[1] <= 12 && +m[2] < 60 && ampm((+m[1] % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + +m[2]) === item2.answer;
    }
    if (item2.type === "time") {
      const m = s.match(/^(\d{1,2}):(\d{2})$/);
      return !!m && +m[1] < 24 && +m[2] < 60 && clock2(+m[1] * 60 + +m[2]) === item2.answer;
    }
    if (item2.type === "repeating") return s.replace(/\s/g, "") === item2.answer;
    for (const m of s.matchAll(/(\d+)\s*\/\s*(\d+)/g)) if (!+m[2] || gcd(+m[1], +m[2]) !== 1) return false;
    if (item2.type === "inequality") {
      let a = inequality(s), b = inequality(item2.answer);
      return !!a && !!b && a[0] === b[0] && Math.abs(a[1] - b[1]) < 1e-9;
    }
    if (["expression", "expanded", "linear", "factored"].includes(item2.type)) {
      let a = polynomial(s), b = polynomial(item2.answer);
      if (!a || !b || a.length !== b.length || !a.every((v, i) => Math.abs(v - b[i]) < 1e-9)) return false;
      const compact = s.replace(/\s/g, "").replace(/[×·]/g, "*").replace(/÷/g, "/");
      if (item2.type === "expression") return /[x+*/×÷()−-]/i.test(compact) && !/^[-+]?\d+(\.\d+)?$/.test(compact);
      if (item2.type === "expanded") return !/[()]/.test(compact);
      if (item2.type === "linear") {
        const num = "(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:/\\d+)?";
        return new RegExp("^[+-]?(?:" + num + "\\*?)?x(?:[+-]" + num + ")?$|^[+-]?" + num + "$", "i").test(compact);
      }
      return /^\d+\*?\(x\+\d+\)$/.test(compact) && Number(compact.match(/^\d+/)[0]) === Number(String(item2.answer).match(/^\d+/)[0]);
    }
    const f2 = s.match(/^(?:-?\d+\s+)?(-?\d+)\s*\/\s*(\d+)$/);
    if (s.includes("/") && !f2) return false;
    if (item2.type === "fraction" && !f2 && !/^-?\d+$/.test(s)) return false;
    if (item2.type === "decimal" && s.includes("/")) return false;
    return Number.isFinite(value(s)) && Math.abs(value(s) - value(item2.answer)) < 1e-9;
  }
  return { list, check, value, polynomial, clock: clock2, ampm };
})();

// ../olivia/src/expansion.ts
var expansionSkills = [
  ["S01", "Two-digit subtraction with one regrouping", "Trade one ten for ten ones. Subtract the ones, then the tens."],
  ["S02", "Subtracting from a multiple of ten", "Trade one ten for ten ones before subtracting."],
  ["S03", "Three-digit subtraction without regrouping", "Subtract ones, tens, and hundreds in their matching places."],
  ["S04", "Three-digit subtraction with one regrouping", "Regroup only where the top digit is too small."],
  ["S05", "Three-digit subtraction with two regroupings", "Work from ones to hundreds, updating each place after a trade."],
  ["S06", "Subtraction across zeros", "Trade from the first nonzero place to the left, passing through the zero."],
  ["S07", "Four-digit subtraction with regrouping", "Keep ones, tens, hundreds, and thousands aligned."],
  ["N01", "Addition with regrouping", "Add ones first. Trade each group of ten for one in the next place."],
  ["N02", "Place value through thousands", "Each place is ten times the value of the place to its right."],
  ["N03", "Comparing and ordering numbers", "Compare the largest place first. Continue right if the digits match."],
  ["N04", "Missing-number equations", "Use addition to undo subtraction, or subtraction to undo addition."],
  ["N05", "Addition and subtraction stories", "Decide whether you need a total, a difference, or a missing starting amount."],
  ["M01", "Multiplication as equal groups", "Add the same group size once for each group."],
  ["M02", "Multiplication facts: 2, 5, 10, 3 and 4", "Use known facts or count in equal steps."],
  ["M03", "Division: sharing and grouping", "Find the multiplication fact that makes the total."],
  ["M04", "Multiplication and division families", "Use the same two factors and their product."],
  ["F01", "Simple fractions", "Fractions refer to equal-sized wholes. A larger denominator means smaller equal parts."]
];
var isExpansion = (id) => expansionSkills.some((s) => s[0] === id);
var numberText = (n) => n.toLocaleString("en-US");
function regrouping(a, b) {
  let borrow = 0, count = 0, acrossZero = false;
  while (a || b) {
    const top = a % 10, bottom = b % 10;
    if (top - borrow < bottom) {
      count++;
      if (top === 0) acrossZero = true;
      borrow = 1;
    } else borrow = 0;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return { count, acrossZero };
}
var cache = /* @__PURE__ */ new Map();
function expansionBank(id) {
  const cached = cache.get(id);
  if (cached) return cached;
  const items = [];
  const add2 = (a, b, answer, prompt, band, help, choices, story) => {
    if (items.some((f) => f.prompt === prompt && f.story === story)) return;
    const key = `${id}:${story || ""}:${prompt}`;
    items.push({ a, b, answer, prompt, kind: "text", key, family: key, band, help, choices, story });
  };
  const arithmetic = (a, b, subtract = true) => {
    const r2 = regrouping(a, b), answer = subtract ? a - b : a + b;
    const help = subtract ? `${expansionSkills.find((s) => s[0] === id)[2]} Check by adding your difference to ${numberText(b)}. It should make ${numberText(a)}.` : "Add the ones first, then tens, then hundreds. Carry each complete ten into the next place.";
    add2(a, b, answer, `${numberText(a)} ${subtract ? "\u2212" : "+"} ${numberText(b)} = ___`, `${r2.count}:${Math.floor(answer / 10) % 4}`, help);
  };
  if (id.startsWith("S")) {
    const digits = id === "S01" || id === "S02" ? 2 : id === "S07" ? 4 : 3;
    const min = 10 ** (digits - 1), max = 10 ** digits - 1;
    const eligible = (a, b) => {
      const r2 = regrouping(a, b);
      return a >= min && b >= min && a <= max && b <= a && (id === "S01" ? a % 10 !== 0 && r2.count === 1 : id === "S02" ? a % 10 === 0 && r2.count === 1 : id === "S03" ? r2.count === 0 : id === "S04" ? r2.count === 1 && !r2.acrossZero : id === "S05" ? r2.count === 2 && !r2.acrossZero : id === "S06" ? r2.acrossZero : r2.count > 0);
    };
    const anchors = { S01: [[52, 27], [71, 46], [83, 58]], S02: [[60, 24], [70, 36]], S03: [[456, 123]], S04: [[452, 127], [452, 182]], S05: [[632, 247]], S06: [[402, 185], [700, 346]], S07: [[3204, 1786], [9999, 1111], [1e3, 999]] };
    for (const [a, b] of anchors[id] || []) if (eligible(a, b)) arithmetic(a, b);
    let seed = 197 + expansionSkills.findIndex((s) => s[0] === id);
    const rand = () => {
      seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
      return seed / 4294967296;
    };
    for (let tries = 0; items.length < 160 && tries < 1e5; tries++) {
      const a = min + Math.floor(rand() * (max - min + 1)), b = min + Math.floor(rand() * (a - min + 1));
      if (eligible(a, b)) arithmetic(a, b);
    }
  } else if (id === "N01") {
    for (let a = 28; a <= 928; a += 37) for (let b = 17; b <= 317; b += 43) if (a % 10 + b % 10 >= 10 || Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 >= 10) arithmetic(a, b, false);
  } else if (id === "N02") {
    for (const a of [120, 305, 840, 1006, 2345, 3406, 5070, 6809, 9021]) for (const place of [1, 10, 100, 1e3]) {
      if (place > a) continue;
      const digit = Math.floor(a / place) % 10, value = digit * place, name = { 1: "ones", 10: "tens", 100: "hundreds", 1e3: "thousands" }[place];
      add2(a, place, value, `What is the value of the ${name} digit in ${numberText(a)}?`, "value", `${digit} in the ${name} place means ${digit} \xD7 ${numberText(place)}.`);
      add2(a, place, value, `${numberText(a)} = ${numberText(a - value)} + ___`, "expand", "Break the number into its place values. Find the missing part.");
    }
    add2(3406, 0, 3406, "Write three thousand four hundred six in digits.", "read", "Combine 3,000, 400, and 6.");
    add2(5070, 0, 5070, "Write five thousand seventy in digits.", "read", "There are 5 thousands, no hundreds, 7 tens, and no ones.");
  } else if (id === "N03") {
    for (const a of [48, 109, 305, 999, 1006, 3406, 5070, 9021]) for (const delta of [-10, 0, 1, 10]) {
      const b = a + delta;
      add2(a, b, a < b ? 0 : a === b ? 1 : 2, `${numberText(a)} ___ ${numberText(b)}`, "compare", "Compare digits from the greatest place to the smallest.", ["<", "=", ">"]);
      if (delta !== 0) {
        const c = a + 20;
        add2(a, b, 0, "Choose the numbers in order, smallest first.", "order", "Find the smallest number first, then compare the other two.", [.../* @__PURE__ */ new Set([[a, b, c].sort((x, y) => x - y).map(numberText).join(", "), [c, a, b].map(numberText).join(", "), [a, c, b].map(numberText).join(", ")])]);
      }
    }
  } else if (id === "N04" || id === "N05") {
    for (let a = 23; a < 180; a += 19) for (let b = 12; b < 80; b += 17) {
      const total = a + b;
      if (id === "N04") {
        add2(a, b, b, `${a} + ___ = ${total}`, "missing-addend", `Subtract ${a} from ${total}.`);
        add2(a, b, total, `___ \u2212 ${b} = ${a}`, "missing-start", `Add ${a} and ${b} to find the starting amount.`);
        add2(a, b, b, `${total} \u2212 ___ = ${a}`, "missing-change", `Find the difference between ${total} and ${a}.`);
      } else {
        add2(a, b, total, "How many stickers does she have now?", "join", "Add the starting amount and the extra amount.", void 0, `Olivia has ${a} stickers. She gets ${b} more.`);
        add2(total, b, a, "How many cards are left?", "separate", "Subtract the amount given away from the starting amount.", void 0, `Olivia has ${total} cards. She gives away ${b}.`);
        add2(total, a, b, "How many more does Olivia have?", "compare", "Find the difference between their amounts.", void 0, `Olivia has ${total} shells. Sam has ${a}.`);
        add2(a, b, total, "How many did she start with?", "start", "Add what was given away to what remains.", void 0, `Olivia gives away ${b} stickers. She has ${a} left.`);
      }
    }
  } else if (id.startsWith("M")) {
    for (const a of [2, 5, 10, 3, 4]) for (let b = 1; b <= 10; b++) {
      const product = a * b, help = `Use ${a} \xD7 ${b} = ${product}.`;
      if (id === "M01") add2(a, b, product, `${a} \xD7 ${b} = ___`, "groups", "Add the group size once for each bag.", void 0, `${a} bags hold ${b} marbles each. How many marbles altogether?`);
      if (id === "M02") add2(a, b, product, `${a} \xD7 ${b} = ___`, `table-${a}`, `Count in steps of ${a}, ${b} times.`);
      if (id === "M03") {
        add2(product, a, b, `${product} \xF7 ${a} = ___`, "sharing", help, void 0, `${product} cookies are shared equally among ${a} children. How many does each get?`);
        add2(product, b, a, `${product} \xF7 ${b} = ___`, "grouping", help, void 0, `${product} cookies go into bags of ${b}. How many bags?`);
      }
      if (id === "M04") {
        add2(a, b, product, `${b} \xD7 ${a} = ___`, "multiply", help, void 0, `Use the fact family ${a}, ${b}, ${product}.`);
        add2(product, a, b, `${product} \xF7 ${a} = ___`, "divide", help, void 0, `Use the fact family ${a}, ${b}, ${product}.`);
      }
    }
  } else if (id === "F01") {
    const fractions = [[1, 2, "one half"], [1, 3, "one third"], [1, 4, "one fourth"], [2, 3, "two thirds"], [3, 4, "three fourths"]];
    for (const [a, b, name] of fractions) {
      const choices = fractions.map((f) => `${f[0]}/${f[1]}`);
      add2(a, b, choices.indexOf(`${a}/${b}`), `Choose ${name}.`, "name", "The numerator tells how many parts; the denominator tells how many equal parts in one whole.", choices);
      for (const [c, d] of fractions) add2(a, b, a * d < c * b ? 0 : a * d === c * b ? 1 : 2, `${a}/${b} ___ ${c}/${d}`, "compare", "Compare fractions of equal-sized wholes. Think about halves and the size and number of the equal parts.", ["<", "=", ">"]);
    }
  }
  items.forEach((f, i) => {
    if (f.choices) {
      const offset = i % f.choices.length;
      f.choices = [...f.choices.slice(offset), ...f.choices.slice(0, offset)];
      f.answer = (f.answer - offset + f.choices.length) % f.choices.length;
    }
    Object.freeze(f);
  });
  cache.set(id, Object.freeze(items));
  return cache.get(id);
}

// ../olivia/src/facts.ts
function eligibleFact(id, a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return false;
  if (isExpansion(id)) return expansionBank(id).some((f) => f.a === a && f.b === b);
  const sum = a + b;
  switch (id) {
    case "N0":
      return a <= 5 && b === 0;
    case "N1":
    case "A1":
      return sum <= 5;
    case "A2":
      return sum <= 10 && Math.min(a, b) <= 2;
    case "A3":
      return a === b && a >= 1 && a <= 5;
    case "A4":
      return sum <= 10;
    case "A5":
      return Math.max(a, b) >= 10 && sum < 20;
    case "A6":
      return a < 10 && b < 10 && sum > 10;
    case "A7":
      return sum <= 20;
    case "S1":
      return a <= 5 && b <= a;
    case "S2":
      return a <= 10 && b <= Math.min(2, a);
    case "S3":
      return a <= 10 && b <= a;
    case "S4":
      return a > 10 && a < 20 && b <= a - 10;
    case "S5":
      return a > 10 && a < 20 && b < 10 && b <= a && a - b < 10;
    case "S6":
      return a <= 20 && b <= a;
  }
}
function bandFor(a, b, kind) {
  if (kind === "quantity") return "quantity";
  if (kind === "subtract") {
    if (b === 0) return "subtract-zero";
    if (a === b) return "take-all";
    if (b <= 2) return "count-back";
    if (b === 10) return "subtract-ten";
    if (a > 10) return a - b < 10 ? "cross-ten" : "keep-ten";
    return a === 10 ? "from-ten" : "within-ten";
  }
  if (a === 0 || b === 0) return "add-zero";
  if (a === b) return "doubles";
  if (Math.abs(a - b) === 1) return "near-doubles";
  if (a + b === 10) return "make-ten";
  if (a < 10 && b < 10 && a + b > 10) return "cross-ten";
  return a + b > 10 ? "tens-and-ones" : "within-ten";
}
var banks = /* @__PURE__ */ new Map();
function factBank(id) {
  if (isExpansion(id)) return expansionBank(id);
  const cached = banks.get(id);
  if (cached) return cached;
  const kind = id === "N0" ? "quantity" : id === "N1" ? "compose" : id.startsWith("S") ? "subtract" : "add";
  const result = [];
  for (let a = 0; a <= 20; a++) for (let b = 0; b <= 20; b++) {
    if (!eligibleFact(id, a, b)) continue;
    const answer = kind === "subtract" ? a - b : a + b, op = kind === "subtract" ? "\u2212" : "+";
    result.push(Object.freeze({
      a,
      b,
      answer,
      kind,
      key: kind === "quantity" ? `count:${a}` : `${a}${op}${b}`,
      prompt: kind === "quantity" ? "How many beads?" : `${a} ${op} ${b} = ?`,
      family: kind === "subtract" ? `sub:${a}:${b}:${answer}` : `${Math.min(a, b)}:${Math.max(a, b)}:${answer}`,
      band: bandFor(a, b, kind)
    }));
  }
  banks.set(id, Object.freeze(result));
  return banks.get(id);
}

// ../olivia/src/shared-math/quarter-time.ts
var clock = (n) => `${Math.floor(n / 60) % 12 || 12}:${String(n % 60).padStart(2, "0")} ${n < 720 ? "AM" : "PM"}`;
function quarterTimeItem(start, duration, forward) {
  const h = Math.floor(duration / 60), m = duration % 60;
  const words = [h ? `${h} hour` : "", m ? `${m} minutes` : ""].filter(Boolean).join(" ");
  return { prompt: `What time is ${words} ${forward ? "after" : "before"} ${clock(forward ? start : start + duration)}? Enter h:mm AM or PM.`, answer: clock(forward ? start + duration : start), type: "time12" };
}
var quarterTime = { id: "g3-time-quarter", grade: 3, name: "Find start/end times: 15-minute steps", standard: "3.MD.A.1 textual component", prereq: "g2-time", make: () => quarterTimeItem((24 + Math.floor(Math.random() * 49)) * 15, (1 + Math.floor(Math.random() * 7)) * 15, Math.random() < 0.5) };

// ../olivia/src/shared-math/catalog.ts
var r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
var item = (prompt, answer, type = "number") => ({ prompt, answer, type });
var primary = [];
var add = (grade, id, name, make, prereq) => primary.push({ grade, id, name, standard: `${grade === 0 ? "K" : grade} text practice`, make, prereq });
var calc = (a, op, b) => item(`${a} ${op} ${b} = ?`, op === "+" ? a + b : a - b);
var compare = (max) => {
  const a = r(0, max), b = r(0, max);
  return item(`Compare: ${a} ___ ${b}. Enter <, > or =.`, a < b ? "<" : a > b ? ">" : "=", "comparison");
};
add(0, "k-next", "Count forward to 20", () => {
  const n = r(0, 19);
  return item(`What number comes after ${n}?`, n + 1);
});
add(0, "k-before", "Count backward within 20", () => {
  const n = r(1, 20);
  return item(`What number comes before ${n}?`, n - 1);
}, "k-next");
add(0, "k-sequence", "Missing numbers to 20", () => {
  const n = r(0, 18);
  return item(`${n}, ___, ${n + 2}. What number is missing?`, n + 1);
}, "k-next");
add(0, "k-compare", "Compare numbers to 10", () => compare(10), "k-next");
add(0, "k-add5", "Addition within 5", () => {
  const a = r(0, 5);
  return calc(a, "+", r(0, 5 - a));
}, "k-next");
add(0, "k-sub5", "Subtraction within 5", () => {
  const a = r(1, 5);
  return calc(a, "\u2212", r(0, a));
}, "k-add5");
add(0, "k-make10", "Make 10", () => {
  const n = r(0, 10);
  return item(`${n} + ___ = 10`, 10 - n);
}, "k-add5");
add(0, "k-add10", "Addition within 10", () => {
  const a = r(0, 10);
  return calc(a, "+", r(0, 10 - a));
}, "k-add5");
add(0, "k-sub10", "Subtraction within 10", () => {
  const a = r(1, 10);
  return calc(a, "\u2212", r(0, a));
}, "k-sub5");
add(0, "k-teen", "Teen numbers: ten and ones", () => {
  const n = r(1, 9);
  return item(`10 + ${n} = ?`, 10 + n);
}, "k-make10");
add(0, "k-stories", "Addition and subtraction stories within 10", () => {
  const a = r(1, 7), b = r(1, 3);
  return r(0, 1) ? item(`You have ${a} shells. You get ${b} more. How many now?`, a + b) : item(`You have ${a + b} shells. You give away ${b}. How many remain?`, a);
}, "k-sub10");
add(1, "g1-next", "Number sequence to 120", () => {
  const a = r(20, 119);
  return item(`What number comes after ${a}?`, a + 1);
}, "k-next");
add(1, "g1-place", "Tens and ones", () => {
  const t = r(1, 9), o = r(0, 9);
  return item(`${t} tens and ${o} ones make what number?`, t * 10 + o);
}, "k-teen");
add(1, "g1-value", "Digit value in two-digit numbers", () => {
  const t = r(1, 9), o = r(0, 9);
  return item(`In ${t * 10 + o}, what is the value of the tens digit?`, t * 10);
}, "g1-place");
add(1, "g1-compare", "Compare two-digit numbers", () => compare(99), "k-compare");
add(1, "g1-add20", "Addition within 20", () => {
  const a = r(1, 19);
  return calc(a, "+", r(1, 20 - a));
}, "k-add10");
add(1, "g1-sub20", "Subtraction within 20", () => {
  const a = r(2, 20);
  return calc(a, "\u2212", r(1, a));
}, "k-sub10");
add(1, "g1-missing", "Missing addition or subtraction numbers", () => {
  const a = r(1, 10), b = r(1, 10);
  return r(0, 1) ? item(`${a} + ___ = ${a + b}`, b) : item(`___ \u2212 ${b} = ${a}`, a + b);
}, "g1-sub20");
add(1, "g1-equal", "Equal expressions", () => {
  const a = r(1, 9), b = r(1, 9), c = r(0, a + b);
  return item(`${a} + ${b} = ${c} + ___`, a + b - c);
}, "g1-add20");
add(1, "g1-three", "Add three numbers within 20", () => {
  const a = r(1, 8), b = r(1, 8), c = r(1, 20 - a - b);
  return item(`${a} + ${b} + ${c} = ?`, a + b + c);
}, "g1-add20");
add(1, "g1-tens", "10 more or 10 less", () => {
  const a = r(10, 89), up = !!r(0, 1);
  return item(`What is 10 ${up ? "more" : "less"} than ${a}?`, a + (up ? 10 : -10));
}, "g1-place");
add(1, "g1-add100", "Two-digit addition without regrouping", () => {
  const a = r(1, 7) * 10 + r(0, 7), b = r(1, 9 - Math.floor(a / 10)) * 10 + r(0, 9 - a % 10);
  return calc(a, "+", b);
}, "g1-place");
add(1, "g1-stories", "Change and comparison stories within 20", () => {
  const a = r(1, 10), b = r(1, 10);
  return r(0, 1) ? item(`Mia has ${a + b} cards. Ben has ${a}. How many more cards does Mia have?`, b) : item(`You had some cards. You gave away ${b}. You have ${a} left. How many did you start with?`, a + b);
}, "g1-missing");
add(1, "g1-time", "Hour and half-hour time in words", () => {
  const h = r(1, 11), half = !!r(0, 1);
  return item(`Write ${half ? "half past" : "exactly"} ${h} in the morning. Use h:mm AM.`, `${h}:` + (half ? "30" : "00") + " AM", "time12");
});
add(2, "g2-place", "Hundreds, tens and ones", () => {
  const h = r(1, 9), t = r(0, 9), o = r(0, 9);
  return item(`${h} hundreds + ${t} tens + ${o} ones = ?`, h * 100 + t * 10 + o);
}, "g1-place");
add(2, "g2-compare", "Compare numbers to 1000", () => compare(1e3), "g1-compare");
add(2, "g2-skip", "Skip count by 2, 5, 10 or 100", () => {
  const step = [2, 5, 10, 100][r(0, 3)], a = r(0, 6) * step;
  return item(`Count by ${step}: ${a}, ${a + step}, ${a + 2 * step}, ___.`, a + 3 * step);
}, "g1-tens");
add(2, "g2-add", "Two-digit addition with regrouping", () => {
  const a = r(1, 4) * 10 + r(1, 9), b = r(1, 4) * 10 + r(10 - a % 10, 9);
  return calc(a, "+", b);
}, "g1-add100");
add(2, "g2-sub", "Two-digit subtraction with one regrouping", () => {
  const a = r(3, 9) * 10 + r(0, 8), b = r(1, Math.floor(a / 10) - 1) * 10 + r(a % 10 + 1, 9);
  return calc(a, "\u2212", b);
}, "g1-sub20");
add(2, "g2-add1000", "Addition within 1000", () => {
  const a = r(100, 800), b = r(10, 1e3 - a);
  return calc(a, "+", b);
}, "g2-add");
add(2, "g2-sub1000", "Subtraction within 1000", () => {
  const a = r(100, 999);
  return calc(a, "\u2212", r(10, a - 1));
}, "g2-sub");
add(2, "g2-mental", "Add or subtract 10 or 100", () => {
  const n = r(200, 800), step = r(0, 1) ? 10 : 100;
  return calc(n, r(0, 1) ? "+" : "\u2212", step);
}, "g1-tens");
add(2, "g2-missing", "Missing numbers within 100", () => {
  const a = r(10, 70), b = r(10, 100 - a);
  return r(0, 1) ? item(`${a + b} \u2212 ___ = ${a}`, b) : item(`___ + ${b} = ${a + b}`, a);
}, "g1-missing");
add(2, "g2-stories", "Two-step addition and subtraction stories", () => {
  const a = r(20, 50), b = r(2, 20), c = r(2, 20);
  return item(`You have ${a} stickers. You get ${b} more, then give away ${c}. How many remain?`, a + b - c);
}, "g2-missing");
add(2, "g2-groups", "Equal groups by repeated addition", () => {
  const a = r(2, 5), b = r(2, 5);
  return item(`${a} bags each hold ${b} shells. How many shells altogether?`, a * b);
}, "g1-three");
add(2, "g2-halves", "Half of an even number", () => {
  const n = r(1, 10);
  return item(`Share ${n * 2} apples equally between 2 people. How many does each person get?`, n);
}, "g2-groups");
add(2, "g2-money", "Coin totals from stated values", () => {
  const a = r(1, 5), b = r(1, 4);
  return item(`${a} coins are worth 10 cents each. ${b} more coins are worth 5 cents each. How many cents altogether?`, a * 10 + b * 5);
}, "g2-skip");
add(2, "g2-time", "Time to five minutes in words", () => {
  const h = r(1, 11), m = r(1, 11) * 5;
  return item(`Write ${m} minutes after ${h} in the morning. Use h:mm AM.`, `${h}:${String(m).padStart(2, "0")} AM`, "time12");
}, "g1-time");
var legacyNames = { N0: "Numbers to 5 (text)", N1: "Compose numbers to 5", A1: "Adding within 5", A2: "Adding 0, 1 and 2", A3: "Doubles within 10", A4: "Making 5 and 10", A5: "Adding to teen numbers", A6: "Adding across 10", A7: "Addition within 20", S1: "Taking away within 5", S2: "Taking away 0, 1 and 2", S3: "Subtraction within 10", S4: "Taking away from teens", S5: "Subtracting across 10", S6: "Subtraction within 20" };
var legacyGrade = { N0: 0, N1: 0, A1: 0, A2: 0, A3: 0, A4: 0, S1: 0, S2: 0, S3: 0, A5: 1, A6: 1, A7: 1, S4: 1, S5: 1, S6: 1, S01: 2, S02: 2, S03: 2, S04: 2, S05: 3, S06: 3, S07: 4, N01: 3, N02: 4, N03: 4, N04: 2, N05: 2, M01: 2, M02: 3, M03: 3, M04: 3, F01: 3 };
var supplemental = [...Object.entries(legacyNames), ...expansionSkills.map(([id, name]) => [id, name])].map(([id, name], i, all) => ({ id, grade: legacyGrade[id], name: `${name} \xB7 Olivia`, standard: "Retained practice", prereq: i ? all[i - 1][0] : void 0, make: () => {
  const bank = factBank(id), p = bank[r(0, bank.length - 1)];
  if (p.kind === "quantity") return item(`0 + ${p.answer} = ?`, p.answer);
  let prompt = [p.story, p.prompt].filter(Boolean).join(" "), answer = p.answer, type = "number";
  if (id === "N03" && p.choices && p.prompt.includes("in order")) {
    const values = [p.a, p.b, p.a + 20];
    return item(`Put these numbers in order, smallest first: ${values.join(", ")}. Separate answers with commas; do not use thousands separators.`, values.sort((a, b) => a - b).join(", "), "sequence");
  }
  if (p.choices) {
    answer = p.choices[p.answer];
    type = ["<", ">", "="].includes(String(answer)) ? "comparison" : String(answer).includes("/") ? "fraction" : "number";
    prompt += " Enter your answer.";
  }
  return item(prompt, answer, type);
} }));
var reference = Skills.list.map((s) => s.id === "g3-elapsed" || s.id === "g3-time-addsubtract" ? { ...s, prereq: quarterTime.id } : s);
var catalog = [...primary, ...supplemental, ...reference.flatMap((s) => s.id === "g3-elapsed" ? [quarterTime, s] : [s])].sort((a, b) => a.grade - b.grade);
var checkAnswer = (q, a) => q.type === "sequence" ? a.replace(/\s/g, "") === String(q.answer).replace(/\s/g, "") : Skills.check(q, a);
var gradeLabel = (grade) => grade === 0 ? "K" : String(grade);
function keypadKeys(type) {
  const extra = type === "sequence" ? [","] : type === "time12" ? [":", "AM", "PM"] : type === "time" ? [":"] : type === "comparison" ? ["<", ">", "="] : type === "inequality" ? ["x", "<", ">", "\u2264", "\u2265"] : ["expression", "expanded", "linear", "factored", "repeating"].includes(type) ? ["x", "+", "\xD7", "(", ")", "^"] : [];
  return ["7", "8", "9", "back", "4", "5", "6", "clear", "1", "2", "3", "-", "0", ".", "/", " ", ...extra];
}

// ../olivia/src/shared-math/engine.ts
var pool = (c) => catalog.filter((s) => s.grade >= c.lo && s.grade <= c.hi && (c.mode === "targeted" ? c.selected.includes(s.id) : !s.optional24 || c.include24));
function configError(c) {
  if (!c || !["general", "targeted", "progression"].includes(c.mode) || !Number.isInteger(c.lo) || !Number.isInteger(c.hi) || c.lo < 0 || c.hi > 7 || c.lo > c.hi) return "Choose a valid grade range from K to 7.";
  if (!Number.isInteger(c.count) || c.count < 1 || c.count > 10) return "Choose 1\u201310 questions per gate.";
  if (typeof c.include24 !== "boolean" || !Array.isArray(c.selected) || !c.selected.every((id) => catalog.some((s) => s.id === id))) return "Choose valid skills.";
  return pool(c).length ? "" : "Select at least one skill in the chosen grade range.";
}
function freshMath(manual = "S01", automatic = false, maximum = "F01") {
  const chosen = catalog.find((s) => s.id === manual) || catalog.find((s) => s.id === "S01");
  return { version: 1, config: { mode: automatic ? "progression" : "targeted", lo: automatic ? 0 : chosen.grade, hi: automatic ? catalog.find((s) => s.id === maximum)?.grade ?? chosen.grade : chosen.grade, count: 5, selected: [chosen.id], include24: false }, history: {}, position: null, returnTo: [], events: [], gate: null, resetSequence: false, note: "" };
}
function validMath(s) {
  try {
    const known = (id) => typeof id === "string" && catalog.some((x) => x.id === id);
    const small = (v) => typeof v === "string" && v.length <= 4e3;
    return s.version === 1 && !configError(s.config) && typeof s.resetSequence === "boolean" && small(s.note) && (s.position === null || known(s.position)) && Array.isArray(s.returnTo) && s.returnTo.length <= catalog.length && s.returnTo.every(known) && !!s.history && typeof s.history === "object" && !Array.isArray(s.history) && Object.entries(s.history).every(([id, h]) => known(id) && Array.isArray(h) && h.length <= 10 && h.every((v) => typeof v === "boolean")) && Array.isArray(s.events) && s.events.length <= 5e3 && s.events.every((e) => Number.isFinite(e.time) && small(e.type) && (e.skill === void 0 || known(e.skill)) && (e.correct === void 0 || typeof e.correct === "boolean") && (e.attempt === void 0 || Number.isInteger(e.attempt) && e.attempt >= 1) && ["response", "prompt", "answer", "context", "from", "to"].every((k) => e[k] === void 0 || small(e[k]))) && (s.gate === null || !configError(s.gate.config) && small(s.gate.context) && small(s.gate.runId) && Number.isInteger(s.gate.completed) && s.gate.completed >= 0 && s.gate.completed < s.gate.config.count && Number.isInteger(s.gate.attempts) && s.gate.attempts >= 0 && Array.isArray(s.gate.bag) && s.gate.bag.length <= catalog.length && s.gate.bag.every((id) => pool(s.gate.config).some((x) => x.id === id)) && known(s.gate.item.skillId) && small(s.gate.item.prompt) && small(s.gate.item.type) && ["string", "number"].includes(typeof s.gate.item.answer) && checkAnswer(s.gate.item, String(s.gate.item.answer)));
  } catch {
    return false;
  }
}
var Practice = class {
  constructor(state, persist = () => {
  }) {
    __publicField(this, "state", state);
    __publicField(this, "persist", persist);
  }
  log(type, extra = {}) {
    this.state.events.push({ time: Date.now(), type, ...extra });
    if (this.state.events.length > 5e3) this.state.events.shift();
  }
  saveConfig(config) {
    const err = configError(config);
    if (err) throw Error(err);
    const s = this.state;
    const changed = ["mode", "lo", "hi", "include24"].some((k) => s.config[k] !== config[k]);
    s.config = structuredClone(config);
    s.resetSequence = s.resetSequence || changed;
    this.log("settings-changed");
    this.persist();
  }
  open(context, runId) {
    const s = this.state;
    if (s.gate && s.gate.context === context && s.gate.runId === runId) return s.gate;
    if (s.resetSequence) {
      s.position = null;
      s.returnTo = [];
      s.resetSequence = false;
    }
    s.gate = { context, runId, config: structuredClone(s.config), completed: 0, attempts: 0, bag: [], item: { prompt: "", answer: 0, type: "number", skillId: "" } };
    this.log("gate-open", { context });
    this.next();
    return s.gate;
  }
  next() {
    const s = this.state, g = s.gate;
    const eligible = pool(g.config);
    let id;
    if (g.config.mode === "progression") {
      if (!s.position || !catalog.some((x) => x.id === s.position) || !s.returnTo.length && !eligible.some((x) => x.id === s.position)) s.position = eligible[0].id;
      id = s.position;
    } else {
      if (!g.bag.length) {
        g.bag = eligible.map((x) => x.id);
        for (let i = g.bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [g.bag[i], g.bag[j]] = [g.bag[j], g.bag[i]];
        }
      }
      id = g.bag.shift();
    }
    const skill = catalog.find((x) => x.id === id);
    g.item = { ...skill.make(), skillId: id };
    g.attempts = 0;
    this.persist();
  }
  first(correct) {
    var _a;
    const s = this.state, g = s.gate, id = g.item.skillId, h = (_a = s.history)[id] || (_a[id] = []);
    h.push(correct);
    if (h.length > 10) h.shift();
    this.log("first-attempt", { skill: id, correct });
    if (g.config.mode !== "progression" || h.length < 10) return;
    const accuracy = h.filter(Boolean).length / 10, eligible = pool(g.config);
    if (accuracy >= 0.8) {
      s.position = s.returnTo.length ? s.returnTo.pop() : eligible[Math.min(eligible.findIndex((x) => x.id === id) + 1, eligible.length - 1)].id;
      this.log("advance", { from: id, to: s.position });
      s.history[id] = [];
    } else if (accuracy < 0.5) {
      const p = catalog.find((x) => x.id === id)?.prereq;
      if (p) {
        s.returnTo.push(id);
        s.position = p;
        s.history[id] = [];
        s.history[p] = [];
        this.log("step-back", { from: id, to: p });
      }
    }
  }
  submit(response) {
    const g = this.state.gate;
    if (!g || !response.trim()) return { correct: false, complete: false };
    const correct = checkAnswer(g.item, response);
    if (g.attempts === 0) this.first(correct);
    g.attempts++;
    this.log("answer", { skill: g.item.skillId, correct, attempt: g.attempts, response, prompt: g.item.prompt, answer: String(g.item.answer), context: g.context });
    if (correct) {
      g.completed++;
      if (g.completed >= g.config.count) {
        this.log("gate-complete", { context: g.context });
        this.state.gate = null;
        this.persist();
        return { correct: true, complete: true };
      }
      this.next();
    }
    this.persist();
    return { correct, complete: false };
  }
  override() {
    if (!this.state.gate) return;
    this.log("adult-override", { context: this.state.gate.context });
    this.state.gate = null;
    this.persist();
  }
  resetSkill(id) {
    delete this.state.history[id];
    this.state.events = this.state.events.filter((e) => e.skill !== id && e.from !== id && e.to !== id);
    this.state.position = null;
    this.state.returnTo = [];
    this.persist();
  }
};

// ../olivia/src/math-format.ts
function formatMath(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/\b(\d+|x)\/(\d+)\b/g, (_, n, d) => `<span class="fraction" role="math" aria-label="${n} over ${d}"><span aria-hidden="true" class="numerator">${n}</span><span aria-hidden="true" class="denominator">${d}</span></span>`).replace(/\^(\d+)/g, "<sup>$1</sup>");
}

// ../olivia/src/shared-math/preview.ts
var searchSkills = (query, lo, hi) => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return catalog.filter((s) => terms.length ? terms.every((t) => `${s.name} ${s.id} ${s.standard} ${/time|elapsed|midnight|notation/.test(s.id) ? "time clock hours minutes" : ""}`.toLowerCase().includes(t)) : s.grade >= lo && s.grade <= hi);
};
var previewSkills = (ids) => {
  const selected = new Set(ids);
  return catalog.filter((s) => selected.has(s.id));
};
function openPreview(root, skills) {
  let index = 0, answer = "", question = skills[0].make();
  const close = () => {
    root.replaceChildren();
    root.hidden = true;
    document.getElementById("diagnostic")?.focus();
  };
  const draw = () => {
    root.hidden = false;
    root.innerHTML = `<section class="math-preview" aria-label="Skill preview"><div class="preview-reading"><div class="row"><strong>Preview ${index + 1} of ${skills.length}</strong><button id="preview-close">Close preview</button></div><p id="preview-skill"></p><div id="preview-question">${formatMath(question.prompt)}</div><p class="note">Preview only \u2014 student progress and current gates are unchanged.</p></div><div class="preview-entry"><label>Answer<input id="preview-answer" readonly inputmode="none" autocomplete="off"></label><div id="preview-answer-format" aria-hidden="true"></div><div id="preview-keypad"></div><div class="row"><button id="preview-submit">Check answer</button><button id="preview-next">${index + 1 === skills.length ? "Finish preview" : "Next skill"}</button></div><p id="preview-feedback" role="status"></p></div></section>`;
    root.querySelector("#preview-skill").textContent = `Grade ${gradeLabel(skills[index].grade)} \xB7 ${skills[index].name} (${skills[index].standard})`;
    const input = root.querySelector("#preview-answer");
    const enter = (key) => {
      if (key === "back") answer = answer.slice(0, -1);
      else if (key === "clear") answer = "";
      else if (key === "AM" || key === "PM") answer = answer.replace(/\s*(?:AM|PM)$/i, "").trimEnd() + " " + key;
      else if (answer.length < 80) answer += key;
      input.value = answer;
      root.querySelector("#preview-answer-format").innerHTML = formatMath(answer);
    };
    const check = () => {
      root.querySelector("#preview-feedback").textContent = !answer.trim() ? "Enter an answer." : checkAnswer(question, answer) ? "Correct." : "Try again. Fractions must be reduced.";
    };
    const keys = keypadKeys(question.type);
    root.querySelector("#preview-keypad").style.gridTemplateColumns = `repeat(${keys.length > 20 ? 5 : 4},minmax(0,1fr))`;
    for (const key of keys) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = { back: "\u232B", clear: "Clear", " ": "Space" }[key] || key;
      b.setAttribute("aria-label", key === "back" ? "Backspace" : b.textContent);
      b.onclick = () => enter(key);
      root.querySelector("#preview-keypad").append(b);
    }
    root.querySelector("#preview-submit").onclick = check;
    root.querySelector("#preview-close").onclick = close;
    root.querySelector("#preview-next").onclick = () => {
      if (++index === skills.length) {
        close();
        return;
      }
      answer = "";
      question = skills[index].make();
      draw();
    };
    root.onkeydown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab" || e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key;
      if (key === "Enter" && e.target === input) {
        e.preventDefault();
        check();
      } else if (key === "Backspace" || key === "Delete" || /^[0-9a-zA-Z.,/:+−\-*=<>≤≥^() ]$/.test(key) && !(key === " " && e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        e.stopPropagation();
        enter(key === "Backspace" ? "back" : key === "Delete" ? "clear" : key);
      }
    };
    input.focus({ preventScroll: true });
    root.scrollIntoView?.({ block: "start" });
  };
  draw();
}

// ../olivia/src/shared-math/settings.ts
var esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function settingsHTML(practice) {
  const s = practice.state, c = s.config;
  const grades = (selected) => Array.from({ length: 8 }, (_, g) => `<option value="${g}" ${g === selected ? "selected" : ""}>${gradeLabel(g)}</option>`).join("");
  return `<section class="panel shared-settings"><style>.shared-settings{font:16px system-ui;line-height:1.4}.shared-settings .settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.shared-settings label{display:block}.shared-settings input,.shared-settings select{max-width:100%}.shared-settings .shared-skills{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-height:320px;overflow:auto;touch-action:pan-y}.shared-settings .row{display:flex;flex-wrap:wrap;gap:8px}.shared-settings button{min-height:40px}.math-preview{border:2px solid;padding:8px;margin:12px 0;display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,40%);gap:12px;height:min(380px,calc(100dvh - 80px))}.preview-reading{overflow:auto;min-height:0}.preview-entry{display:grid;grid-template-rows:54px 32px minmax(136px,1fr) 28px 18px;gap:3px;min-height:0}.math-preview button{min-height:24px;height:100%;padding:2px 4px;font-size:13px;box-shadow:none}.math-preview #preview-feedback{margin:0;font-size:12px}.math-preview .preview-entry .row{flex-wrap:nowrap}.math-preview #preview-answer{height:32px;padding:3px}.math-preview .note{font-size:13px}.math-preview #preview-question{font-size:22px}.math-preview #preview-answer{width:100%;font-size:20px}.math-preview #preview-answer-format{min-height:0;overflow:auto;display:flex;align-items:center;font-size:13px;line-height:1.05}.math-preview #preview-keypad{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(5,minmax(0,1fr));gap:4px;margin:0}.shared-settings .fraction{display:inline-flex;flex-direction:column;text-align:center;vertical-align:middle;margin:0 3px}.shared-settings .numerator{border-bottom:1px solid;padding:0 3px}.shared-settings .denominator{padding:0 3px}@media(max-width:600px){.shared-settings .shared-skills{grid-template-columns:1fr}.math-preview{grid-template-columns:1fr;height:auto}.preview-entry{min-height:300px}.preview-reading{overflow:visible}}</style><h2>Math practice</h2><p>Math changes apply at the next gate. Current gate keeps its question count and content.</p>${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}<div class="settings-grid"><label>Mode<select id="mode">${[["general", "Mixed Review \u2014 General"], ["targeted", "Mixed Review \u2014 Targeted"], ["progression", "Fixed Progression"]].map(([v, n]) => `<option value="${v}" ${c.mode === v ? "selected" : ""}>${n}</option>`).join("")}</select></label><label>Questions per gate<input id="count" type="number" min="1" max="10" value="${c.count}"></label><label>First grade<select id="lo">${grades(c.lo)}</select></label><label>Last grade<select id="hi">${grades(c.hi)}</select></label></div><label><input type="checkbox" id="include24" ${c.include24 ? "checked" : ""}> Include 24-hour time in General Review / Fixed Progression</label><p class="note">Off by default. Ordinary time questions use AM/PM. In Targeted Review, select the separate 24-hour time skill explicitly.</p><details><summary>How progression works (?)</summary><p>80% first-attempt accuracy over 10 questions advances a skill. Below 50% steps back to a linked prerequisite; mastering it returns to the former skill. Prerequisite review may use an earlier grade. Wrong answers retry without revealing the answer. All fraction answers must be reduced.</p></details><p>Targeted Review uses checked skills. General Review and Fixed Progression use all eligible skills within the selected range. Checked skills also choose what to preview, in any mode.</p><p class="note">${catalog.length} selectable text skills across K\u20137, with shared generators and retained practice. No geometry, graphs or counting manipulatives. Text practice is not a complete grade curriculum.</p><label>Search skills<input id="skill-search" type="search" placeholder="Search all grades, e.g. time" autocomplete="off"></label><p class="note">Search covers every grade, ordered K\u20137. Within each grade, catalog order is used\u2014not a difficulty ranking. Checking a result outside the range expands the draft range.</p><p id="selection-status" role="status"></p><div id="skills" class="shared-skills"></div><section class="selected-skills"><h3 id="selected-heading">Selected skills</h3><button id="clear-selection">Clear selection</button><p class="note">This is the complete checked list, including previous choices. Searching does not remove selections. In Targeted Review, only checked skills within the grade range are used.</p><div id="selected-list"></div></section><div class="row"><button id="save-settings" class="primary">Save settings</button><button id="diagnostic">Preview selected skills</button></div><p class="note">Preview one question per checked skill, in grade order. Preview uses unsaved selections without saving settings or changing student progress.</p><div id="skill-preview" hidden></div><p id="notice" role="status"></p><h2>Progress and reports</h2><p>Current skill: ${esc(s.position || "review")}. Gates completed: ${s.events.filter((e) => e.type === "gate-complete").length}.</p><div class="row"><button id="math-csv">Export CSV</button><button id="override" ${s.gate ? "" : "disabled"}>Unlock current gate</button><button id="math-reset">Clear math practice</button></div><p class="note">Math history stays on this device. The most recent 5,000 events are retained. Export before deleting. Math-only deletion keeps game progress and rewards.</p><div class="shared-history"><table><thead><tr><th>Skill</th><th>First attempts</th><th>Delete</th></tr></thead><tbody>${Object.entries(s.history).map(([id, h]) => `<tr><td>${esc(catalog.find((x) => x.id === id)?.name || id)}</td><td>${h.filter(Boolean).length} / ${h.length}</td><td><button data-math-reset="${id}">Reset evidence</button></td></tr>`).join("") || '<tr><td colspan="3">No practice yet.</td></tr>'}</tbody></table><h3>Recent attempts</h3>${s.events.filter((e) => e.type === "answer").slice(-12).reverse().map((e) => `<p>${formatMath(e.prompt || "")} \xB7 Response: ${formatMath(e.response || "")} \xB7 ${e.correct ? "Correct" : "Try again"}</p>`).join("")}</div></section>`;
}
function wireSettings(practice, onOverride, onReset) {
  const c = practice.state.config, selected = new Set(c.selected), el = (id) => document.getElementById(id);
  const summary = () => {
    const checked = previewSkills(selected), lo = Number(el("lo").value), hi = Number(el("hi").value);
    el("selected-heading").textContent = `Selected skills (${checked.length})`;
    el("selected-list").innerHTML = checked.map((s) => `<div class="row"><span>Grade ${gradeLabel(s.grade)} \xB7 ${esc(s.name)}${s.grade < lo || s.grade > hi ? " \u2014 outside current grade range" : ""}</span><button data-unselect="${s.id}" aria-label="Remove ${esc(s.name)}">Remove</button></div>`).join("") || "<p>No skills selected.</p>";
    document.querySelectorAll("[data-unselect]").forEach((b) => b.onclick = () => {
      selected.delete(b.dataset.unselect);
      draw();
    });
  };
  const draw = () => {
    const lo = Number(el("lo").value), hi = Number(el("hi").value), results = searchSkills(el("skill-search").value, lo, hi);
    document.getElementById("skills").innerHTML = results.map((s) => `<label><input type="checkbox" value="${s.id}" ${selected.has(s.id) ? "checked" : ""}> ${s.grade === 0 ? "K" : "G" + s.grade} \xB7 ${esc(s.name)} (${esc(s.standard)})</label>`).join("") || "<p>No matching skills.</p>";
    el("selection-status").textContent = `${results.length} results \xB7 ${selected.size} checked for preview (including hidden selections).`;
    summary();
    document.querySelectorAll("#skills input").forEach((input) => input.onchange = () => {
      if (input.checked) {
        selected.add(input.value);
        const skill = catalog.find((s) => s.id === input.value);
        if (skill.grade < lo || skill.grade > hi) {
          el("lo").value = String(Math.min(lo, skill.grade));
          el("hi").value = String(Math.max(hi, skill.grade));
          el("notice").textContent = "Draft grade range expanded to include the checked skill. Save to apply at the next gate.";
        }
      } else selected.delete(input.value);
      el("selection-status").textContent = `${results.length} results \xB7 ${selected.size} checked for preview (including hidden selections).`;
      summary();
    });
  };
  for (const key of ["mode", "lo", "hi", "count"]) el(key).value = String(c[key]);
  el("include24").checked = c.include24;
  el("clear-selection").onclick = () => {
    selected.clear();
    draw();
    el("notice").textContent = "Selection cleared. Check the skills you want, then save.";
  };
  el("lo").onchange = draw;
  el("hi").onchange = draw;
  el("skill-search").oninput = draw;
  draw();
  el("diagnostic").onclick = () => {
    const skills = previewSkills(selected);
    if (!skills.length) {
      el("notice").textContent = "Check at least one skill to preview.";
      return;
    }
    el("notice").textContent = "";
    openPreview(document.getElementById("skill-preview"), skills);
  };
  el("save-settings").onclick = () => {
    try {
      practice.saveConfig({ mode: el("mode").value, lo: Number(el("lo").value), hi: Number(el("hi").value), count: Number(el("count").value), include24: el("include24").checked, selected: [...selected] });
      const checked = previewSkills(selected).filter((s) => s.grade >= Number(el("lo").value) && s.grade <= Number(el("hi").value));
      el("notice").textContent = el("mode").value === "targeted" ? `Saved Targeted Review: ${checked.length} skills \u2014 ${checked.map((s) => "Grade " + gradeLabel(s.grade) + " " + s.name).join("; ")}. Starts at the next gate.` : "Saved. Math changes start at the next gate.";
    } catch (e) {
      el("notice").textContent = e.message;
    }
  };
  el("override").onclick = () => {
    if (confirm("Unlock this gate? The adult override will be recorded.")) {
      practice.override();
      onOverride();
    }
  };
  el("math-reset").onclick = () => {
    if (confirm(`Delete all ${practice.state.events.length} math events, skill evidence and the unfinished gate? Settings and game rewards stay. Export progress first; deletion cannot be undone here.`)) onReset();
  };
  document.querySelectorAll("[data-math-reset]").forEach((b) => b.onclick = () => {
    const id = b.dataset.mathReset, n = practice.state.events.filter((e) => e.skill === id || e.from === id || e.to === id).length;
    if (confirm(`Delete ${n} math records for this skill? Other skills and rewards stay. Export progress first; this cannot be undone here.`)) {
      practice.resetSkill(id);
      b.closest("tr")?.remove();
    }
  });
  el("math-csv").onclick = () => {
    const cols = ["time", "type", "context", "skill", "correct", "attempt", "response", "prompt", "from", "to"];
    const csv = [cols.join(","), ...practice.state.events.map((e) => cols.map((k) => '"' + String(e[k] ?? "").replace(/"/g, '""') + '"').join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })), a = document.createElement("a");
    a.href = url;
    a.download = "Math-Report.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  };
}
export {
  Practice,
  catalog,
  checkAnswer,
  configError,
  formatMath,
  freshMath,
  keypadKeys,
  pool,
  settingsHTML,
  validMath,
  wireSettings
};
