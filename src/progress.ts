import data from "./assets/profiles_scraped_data.json";
import assignments from "./assets/assignments.json";

const SHOW_EXPECTED = process.env.SHOW_EXPECTED || false;

const completed_all = data.filter((user) => user.completed_assignments_count === assignments.assignments.length && user.arcade_badge_progress === true);
console.log("Number of users who have completed all badges:", completed_all.length + "\n");

const completed_some = data.filter((user) => user.completed_assignments_count > 0 && user.completed_assignments_count < assignments.assignments.length);

console.log("Number of users who have completed some badges:", completed_some.length + "\n");

const completed_none = data.filter((user) => user.completed_assignments_count === 0 && user.arcade_badge_progress === false);
console.log("Number of users who have completed no badges (including Arcade):", completed_none.length + "\n");

const completed_assignments_count = data.map((user) => user.completed_assignments_count);

for (let index = 0; index <= assignments.assignments.length; index++) {
  const count = completed_assignments_count.filter((num) => num === index).length;
  console.log(`Number of users who have completed exactly ${index} badges:`, count);

  if (index === assignments.assignments.length) {
    const users = data.filter((user) => user.completed_assignments_count === assignments.assignments.length && user.arcade_badge_progress === true);
    console.log("\nUsers who have completed all badges:");
    users.forEach((user) => console.log(user.name, "<" + user.email + ">"));

    const non_arcade = data.filter((user) => user.completed_assignments_count === assignments.assignments.length && user.arcade_badge_progress === false);
    non_arcade.length > 0 && console.log("\nUsers who have completed all badges but not the Arcade badge:");
    non_arcade.forEach((user) => console.log(user.name));
  };
};

console.log("\nNumber of users who have completed the Arcade badge:", data.filter((user) => user.arcade_badge_progress === true).length);

assignments.assignments.map((assignment) => {
  const count = data.filter((user) => user.completed_assignments.includes(assignment)).length;
  console.log(`Number of users who have completed "${assignment}":`, count);
});

const remaining_one_badge = data.filter((user) => user.completed_assignments_count === assignments.assignments.length - 1);
console.log("\nNumber of Users who are remaining with only one badge:", remaining_one_badge.length);
remaining_one_badge.forEach((user) => {
  console.log(`${user.name} <${user.email}> has pending course "${user.incomplete_assignments[0]}"`);
});

if (SHOW_EXPECTED) {
  const expected = remaining_one_badge.length;
  console.log("\nExpected number of users who will complete all badges:", expected);
  console.log("\nExpected number of users by the end of the program:", expected + completed_all.length);
};
