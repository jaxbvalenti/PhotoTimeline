export const friends = [
  {
    name: "Jamie",
    distance: "0.3 mi",
    avatar: "/photos/friends.png",
  },
  {
    name: "Sarah",
    distance: "0.6 mi",
    avatar: "/photos/group.png",
  },
  {
    name: "Chris",
    distance: "1.2 mi",
    avatar: "/photos/beach.jpeg",
  },
  {
    name: "Maya",
    distance: "2.1 mi",
    avatar: "/photos/hero.png",
  },
];

export const photos = [
  "/photos/memory-beach.png",
  "/photos/memory-pier.png",
  "/photos/memory-friends.png",
  "/photos/memory-camp.png",
  "/photos/memory-road.png",
  "/photos/memory-lake.png",
  "/photos/memory-sunset.png",
  "/photos/memory-city.png",
];

export const memories = [
  {
    id: 1,
    title: "Beach Day",
    date: "Today",
    fullDate: "June 24, 2024",
    location: "Santa Monica",
    place: "Santa Monica Pier",
    count: 23,
    cover: photos[0],
    photos: [photos[0], photos[1], photos[2], photos[3]],
    people: "You and Sarah",
  },
  {
    id: 2,
    title: "Camping Trip",
    date: "May 12",
    fullDate: "May 12, 2024",
    location: "Big Bear Lake",
    place: "Big Bear Lake",
    count: 42,
    cover: photos[5],
    photos: [photos[5], photos[7], photos[4], photos[1]],
    people: "Sarah, Jamie, Chris",
  },
  {
    id: 3,
    title: "Road Trip",
    date: "Jun 15",
    fullDate: "June 15, 2024",
    location: "Pacific Coast",
    place: "PCH",
    count: 12,
    cover: photos[6],
    photos: [photos[6], photos[3], photos[2], photos[7]],
    people: "You and friends",
  },
];

export const mapPins = [
  { id: 1, top: "16%", left: "70%", count: 17, image: photos[1] },
  { id: 2, top: "30%", left: "56%", count: 8, image: photos[3] },
  { id: 3, top: "45%", left: "34%", count: 12, image: photos[2] },
  { id: 4, top: "23%", left: "28%", count: 23, image: photos[0] },
  { id: 5, top: "52%", left: "80%", count: 12, image: photos[6] },
];
