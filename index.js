// Package required to make HTTP requests
const axios = require('axios');

// Initial values to make requests
const url = 'http://wp8m3he1wt.s3-website-ap-southeast-2.amazonaws.com';
let path = '/api/products/1';

// Function to filter all items from a specific category passed as a parameter
const filterItems = (items, category) => {
  return items.filter((i) => {
    return i.category === category;
  });
};

const calculateCubicWeightAverage = (items) => {
  let cubicWeights = [];

  // Loop thorught items and calculate cubic weight and store each value in the cubicWeights array
  items.forEach((i) => {
    cubicWeights.push(
      (i.size.width / 100) * (i.size.length / 100) * (i.size.height / 100) * 250
    );
  });

  // We use the reduce method to calculate the average of all items in the cubicWeights array
  const averageCubicWeight =
    cubicWeights.reduce((a, b) => a + b, 0) / cubicWeights.length;

  return averageCubicWeight;
};

// We use a recursive promise that will use the internal fetchItems method to:
// - make a request to the initial url and path
// - accumulate the objects in the response into the items array
// - check the value of the next attribute in the response
// - make a new request if the next attribute is not null by recursively invocating the fetchItems method
// - resolve the promise with the accumulated items if the next attribute is null
const itemsPromise = new Promise((resolve, reject) => {
  let items = [];

  const fetchItems = async (path) => {
    axios
      .get(url + path)
      .then((response) => {
        items = items.concat(response.data.objects);
        if (response.data.next) {
          fetchItems(response.data.next);
        } else {
          resolve(items);
        }
      })
      .catch((error) => reject(error.message));
  };
  fetchItems(path);
});

// Here we consume the promise we created earlier, filter the results using the filterItems declared
// at the top of the file, and console out the desired average that comes from a separated method as well.
itemsPromise
  .then(async (items) => {
    const airConditioners = filterItems(items, 'Air Conditioners');
    console.log(
      'Average cubic weight of air conditioners:',
      calculateCubicWeightAverage(airConditioners)
    );
  })
  .catch((error) => console.log(error));
