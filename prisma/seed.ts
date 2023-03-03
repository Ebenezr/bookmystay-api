import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seed() {
  const john = await prisma.user.upsert({
    where: { email: "john@prisma.io" },
    update: {},
    create: {
      name: "John Doe",
      email: "john@prisma.io",
      password: "",
      image_url: "https://picsum.photos/200/300",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "mercy@prisma.io" },
    update: {},
    create: {
      name: "Mercy Grace",
      email: "mercy@prisma.io",
      image_url: "https://picsum.photos/200/300",
      password: "",
    },
  });

  const cat = [
    {
      name: "MARGARINE",
      products: {
        create: {
          name: "Prestige Margarine",
          description:
            "Having a base of pure vegetable oils, this smooth and premium margarine has a soft yellow color with a fine refined taste. You’ll find it hard to believe it’s not butter!",
          price: 224.99,
          image_url: "https://picsum.photos/200",
          size: "1KG",
          rating: 5,
          color: "",
          discount: 25,
          sponsored: true,
        },
      },
    },
    {
      name: "BAKING POWDER",
      products: {
        create: {
          name: "Chapa Mandashi",
          description:
            "Chapa Mandashi Baking Powder has been in the market for over 40 years and is the ultimate choice for all your baking purposes giving you ‘Perfect baking every time’",
          price: 14.99,
          image_url: "https://picsum.photos/200",
          size: "100G",
          rating: 5,
          color: "",
          discount: 10,
          sponsored: true,
        },
      },
    },
    {
      name: "Noodles",
      products: {
        create: {
          name: "Numi",
          description:
            "Numi Instant Noodles is proudly Kenyan. Manufactured using state of the art technology, Numi is Halal certified and packed under the highest quality standards How to cook in the cook in 3 minutes",
          price: 29.99,
          image_url: "https://example.com/smartphone.jpg",
          size: "400G",
          rating: 3.5,
          color: "",
          discount: 15,
          sponsored: false,
        },
      },
    },
    {
      name: "Cooking Fat",
      products: {
        create: {
          name: "Kasuku",
          description:
            "Kasuku, East Africa’s most popular cooking fat, is a pure white cooking fat manufactured using refined natural vegetable palm oil. You will enjoy cooking with Kasuku’s soft and smooth texture. Kasuku is manufactured and packed under the highest international quality control standards",
          price: 799.99,
          image_url: "https://example.com/smartphone.jpg",
          size: "10KG",
          rating: 3.5,
        },
      },
    },
    {
      name: "Vegetable Oil",
      code: "VB01",
      image_url:
        "https://res.cloudinary.com/dbkeoqmg5/image/upload/v1677308674/eeksfq1fiipbstvkwvfz.png",
      products: {
        create: {
          name: "Rina",
          description:
            "Rina Vegetable Oil is processed in an extremely modern and technologically advanced refining plant.",
          price: 999.99,
          image_url: "https://example.com/laptop.jpg",
          size: "5L",
          rating: 3.5,
        },
      },
    },
  ];
  for (const product of cat) {
    await prisma.productCategory.create({
      data: product,
    });
  }

  console.log("done seeding");
}
seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
