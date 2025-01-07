const pricingData = {
  long: {
    fullColor: 13,
    midColor: 9,
    spotColor: 5,
    blackWhite: 3,
  },
  short: {
    fullColor: 10,
    midColor: 8,
    spotColor: 4,
    blackWhite: 2,
  },
  a4: {
    fullColor: 10,
    midColor: 8,
    spotColor: 4,
    blackWhite: 2,
  },
};
const colorAmounts = [
  "full_color_pages",
  "mid_color_pages",
  "spot_color_pages",
];

export default function calculateFilePrice(f) {
  let price = 0;
  if (f.mode === "all") {
    if (f.ranges[0].color === "c") {
      const arr = [];
      for (let ca of colorAmounts) {
        if (f[ca] != null) {
          arr.push(countMembersInRange(f[ca], `1-${f.num_pages}`));
        } else {
          arr.push(0);
        }
      }
      arr.push(f.num_pages - arr[0] - arr[1] - arr[2]);

      let temp = 0;
      temp +=
        arr[0] *
        pricingData[
          f.ranges[0].paperSize === "l"
            ? "long"
            : f.ranges[0].paperSize === "s"
            ? "short"
            : "a4"
        ].fullColor;
      temp +=
        arr[1] *
        pricingData[
          f.ranges[0].paperSize === "l"
            ? "long"
            : f.ranges[0].paperSize === "s"
            ? "short"
            : "a4"
        ].midColor;
      temp +=
        arr[2] *
        pricingData[
          f.ranges[0].paperSize === "l"
            ? "long"
            : f.ranges[0].paperSize === "s"
            ? "short"
            : "a4"
        ].spotColor;
      temp +=
        arr[3] *
        pricingData[
          f.ranges[0].paperSize === "l"
            ? "long"
            : f.ranges[0].paperSize === "s"
            ? "short"
            : "a4"
        ].blackWhite;

      price += temp * Number(f.ranges[0].copies);
    } else {
      price +=
        f.ranges[0].copies *
        f.num_pages *
        pricingData[
          f.ranges[0].paperSize === "l"
            ? "long"
            : f.ranges[0].paperSize === "s"
            ? "short"
            : "a4"
        ].blackWhite;
    }
  } else {
    for (let r of f.ranges) {
      if (r.color === "c") {
        const arr = [];
        for (let ca of colorAmounts) {
          if (f[ca] != null) {
            arr.push(countMembersInRange(f[ca], r.range));
          } else {
            arr.push(0);
          }
        }
        arr.push(f.num_pages - arr[0] - arr[1] - arr[2]);

        let temp = 0;
        temp +=
          arr[0] *
          pricingData[
            r.paperSize === "l" ? "long" : r.paperSize === "s" ? "short" : "a4"
          ].fullColor;
        temp +=
          arr[1] *
          pricingData[
            r.paperSize === "l" ? "long" : r.paperSize === "s" ? "short" : "a4"
          ].midColor;
        temp +=
          arr[2] *
          pricingData[
            r.paperSize === "l" ? "long" : r.paperSize === "s" ? "short" : "a4"
          ].spotColor;
        temp +=
          arr[3] *
          pricingData[
            r.paperSize === "l" ? "long" : r.paperSize === "s" ? "short" : "a4"
          ].blackWhite;

        price += temp * Number(r.copies);
      } else {
        price +=
          r.copies *
          f.num_pages *
          pricingData[
            r.paperSize === "l" ? "long" : r.paperSize === "s" ? "short" : "a4"
          ].blackWhite;
      }
    }
  }

  return price;
}

function parseRange(rangeString) {
  let numbers = [];

  // Split the string by commas to process individual parts
  let parts = rangeString.split(",");

  parts.forEach((part) => {
    if (part.includes("-")) {
      // If it's a range, expand it
      let [start, end] = part.split("-").map(Number);
      for (let i = start; i <= end; i++) {
        numbers.push(i);
      }
    } else {
      // Otherwise, it's a single number
      numbers.push(Number(part));
    }
  });

  return numbers;
}

function countMembersInRange(range1, range2) {
  // Parse both range1 and range2 into arrays of numbers
  const range1Numbers = parseRange(range1);
  const range2Numbers = parseRange(range2);

  // Create a Set from range1Numbers for fast lookup
  const range1Set = new Set(range1Numbers);

  // Count how many elements of range2 are in range1
  let count = 0;
  range2Numbers.forEach((num) => {
    if (range1Set.has(num)) {
      count++;
    }
  });

  return count;
}
