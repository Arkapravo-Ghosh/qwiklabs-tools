import data from "./assets/profiles_scraped_data.json";
import assignments from "./assets/assignments.json";

const completed_all = data.filter((user) => user.completed_assignments_count === assignments.length);
console.log("Number of users who have completed all badges:", completed_all.length + "\n");

const completed_some = data.filter((user) => user.completed_assignments_count > 0 && user.completed_assignments_count < assignments.length);

console.log("Number of users who have completed some badges:", completed_some.length + "\n");

const completed_none = data.filter((user) => user.completed_assignments_count === 0);
console.log("Number of users who have completed no badges:", completed_none.length + "\n");

const completed_assignments_count = data.map((user) => user.completed_assignments_count);

for (let index = 0; index <= assignments.length; index++) {
  const count = completed_assignments_count.filter((num) => num === index).length;
  console.log(`Number of users who have completed ${index} badges:`, count);

  if (index === assignments.length) {
    const users = data.filter((user) => user.completed_assignments_count === 16);
    console.log("\nUsers who have completed all badges:");
    users.forEach((user) => console.log(user.name));
  };
};