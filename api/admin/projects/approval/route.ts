import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { cookies } from "next/headers";

// Import the Product model
import Product from "@/models/Project"; // Ensure this path is correct

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

    // Parse the request body
    const body = await request.json();
    console.log("Request body:", body);

    // Save the data to the database
    const newProduct = new Product(body);
    await newProduct.save();
    console.log("New product saved:", newProduct);

    // Fetch the updated data from the database
    const products = await Product.find();
    console.log("Updated products:", products);

    // Return the updated data in the response
    return NextResponse.json({ message: "Success", data: products }, { status: 200 });
  } catch (error) {
    console.error("Error in POST handler:", error);

    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}