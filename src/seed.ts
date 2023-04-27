import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seed(prisma: PrismaClient) {
  const superuserEmail =
    process.env.SUPERUSER_EMAIL || "superuser@roomsoft.com";
  const superuserPassword =
    process.env.SUPERUSER_PASSWORD || "superuser_code_56";

  const existingSuperuser = await prisma.user.findFirst({
    where: { superuser: true },
  });

  if (!existingSuperuser) {
    const hashedPassword = await bcrypt.hash(superuserPassword, 10);
    await prisma.user.create({
      data: {
        email: superuserEmail,
        password: hashedPassword,
        name: "Superuser",
        superuser: true,
        phone: "0706731810",
        role: "ADMIN",
      },
    });
    console.log("Superuser created.");
  } else {
    console.log("Superuser already exists.");
  }
}

// Call the seed function with a new PrismaClient instance if the file is executed directly
if (require.main === module) {
  const prismaInstance = new PrismaClient();
  seed(prismaInstance)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prismaInstance.$disconnect();
    });
}
