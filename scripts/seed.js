require("dotenv").config();

const mongoose = require("mongoose");
const connectMongo = require("../src/config/mongo-config");
const User = require("../src/modules/user/models/user");
const Cart = require("../src/modules/cart/models/cart");
const Availability = require("../src/modules/availability/models/availability");
const Product = require("../src/modules/product/models/product");
const Post = require("../src/modules/post/models/post");
const Podcast = require("../src/modules/podcast/models/podcast");
const { hashPassword } = require("../src/modules/auth/strategies/password-strategy");

const PASSWORD = "Morada123!";

async function upsertUser(data) {
  const password = await hashPassword(PASSWORD);
  return User.findOneAndUpdate(
    { _id: data._id },
    { ...data, password },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function ensureCart(user) {
  const cart = await Cart.findOneAndUpdate(
    { user_id: user._id },
    { $setOnInsert: { user_id: user._id, products_id: [], total: 0 } },
    { upsert: true, new: true }
  );
  user.cart_id = cart._id;
  await user.save();
}

async function seed() {
  await connectMongo();

  const psychologist = await upsertUser({
    _id: "1000000001",
    document_type: "CC",
    email: "psicologa@lamorada.test",
    name: "Laura",
    last_name1: "Moreno",
    last_name2: "Diaz",
    age: 34,
    role: "psychologist",
    phone: "3000000001",
    specialty: "Ansiedad y habitos",
  });

  const patient = await upsertUser({
    _id: "2000000001",
    document_type: "CC",
    email: "paciente@lamorada.test",
    name: "Camila",
    last_name1: "Rojas",
    last_name2: "Lopez",
    age: 25,
    role: "patient",
    phone: "3000000002",
  });

  await ensureCart(psychologist);
  await ensureCart(patient);

  let availability = psychologist.availability_id
    ? await Availability.findById(psychologist.availability_id)
    : null;
  if (!availability) availability = new Availability();
  availability.days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  availability.slots = [{ start: "08:00", end: "18:00" }];
  await availability.save();
  psychologist.availability_id = availability._id;
  await psychologist.save();

  const product = await Product.findOneAndUpdate(
    { title: "Habitos atomicos" },
    {
      title: "Habitos atomicos",
      author: "James Clear",
      publish_year: 2018,
      price: 65000,
      cover_url: "https://images-na.ssl-images-amazon.com/images/I/81wgcld4wxL.jpg",
    },
    { upsert: true, new: true }
  );

  await Post.findOneAndUpdate(
    { title: "Cinco minutos para volver al presente" },
    {
      psychologist_id: psychologist._id,
      title: "Cinco minutos para volver al presente",
      content: "Una practica breve de respiracion y observacion consciente.",
      active: true,
    },
    { upsert: true, new: true }
  );

  await Podcast.findOneAndUpdate(
    { youtubeId: "inpok4MKVLM" },
    {
      title: "Respiracion consciente",
      description: "Contenido demostrativo para el ambiente local.",
      youtubeId: "inpok4MKVLM",
      creator_id: psychologist._id,
      creator_name: `${psychologist.name} ${psychologist.last_name1}`,
    },
    { upsert: true, new: true }
  );

  console.log("Datos locales creados.");
  console.log(`Psicologa: ${psychologist.email} / ${PASSWORD}`);
  console.log(`Paciente: ${patient.email} / ${PASSWORD}`);
  console.log(`Producto: ${product.title}`);
}

seed()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  });