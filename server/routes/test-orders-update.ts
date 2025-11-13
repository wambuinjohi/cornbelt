import { RequestHandler } from "express";

/**
 * Test endpoint to verify the admin orders update flow
 * This helps audit that database updates are working correctly
 */
export const handleTestOrdersUpdate: RequestHandler = async (
  req,
  res,
) => {
  try {
    // Step 1: Create a test order
    const createResponse = await fetch(
      `${req.protocol}://${req.get("host")}/api.php?table=orders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Test User",
          email: "test@example.com",
          phone: "+254712345678",
          location: "Test Location",
          product: "Test Product",
          size: "2kg",
          quantity: 1,
          deliveryDate: new Date().toISOString().split("T")[0],
          status: "pending",
          notes: "Initial test order",
          totalPrice: 100,
        }),
      },
    );

    if (!createResponse.ok) {
      throw new Error(`Failed to create test order: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    const testOrderId = createData.id;

    if (!testOrderId) {
      throw new Error("No order ID returned from creation");
    }

    // Step 2: Verify order was created
    const readResponse = await fetch(
      `${req.protocol}://${req.get("host")}/api.php?table=orders&id=${testOrderId}`,
    );

    if (!readResponse.ok) {
      throw new Error(`Failed to read test order: ${readResponse.status}`);
    }

    const readData = await readResponse.json();

    if (!readData || readData.id !== testOrderId) {
      throw new Error("Created order not found in database");
    }

    // Step 3: Update the order (this is what admin does)
    const updateResponse = await fetch(
      `${req.protocol}://${req.get("host")}/api.php?table=orders&id=${testOrderId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "confirmed",
          notes: "Updated via test endpoint",
        }),
      },
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update test order: ${updateResponse.status}`);
    }

    const updateData = await updateResponse.json();

    // Step 4: Verify update was applied
    const verifyResponse = await fetch(
      `${req.protocol}://${req.get("host")}/api.php?table=orders&id=${testOrderId}`,
    );

    if (!verifyResponse.ok) {
      throw new Error(`Failed to verify test order: ${verifyResponse.status}`);
    }

    const verifyData = await verifyResponse.json();

    if (
      verifyData.status !== "confirmed" ||
      verifyData.notes !== "Updated via test endpoint"
    ) {
      throw new Error(
        "Order update was not persisted correctly in database",
      );
    }

    // Step 5: Delete the test order
    const deleteResponse = await fetch(
      `${req.protocol}://${req.get("host")}/api.php?table=orders&id=${testOrderId}`,
      { method: "DELETE" },
    );

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete test order: ${deleteResponse.status}`);
    }

    // Step 6: Verify deletion
    const deletedReadResponse = await fetch(
      `${req.protocol}://${req.get("host")}/api.php?table=orders&id=${testOrderId}`,
    );

    const deletedData = await deletedReadResponse.json();
    if (deletedData !== null) {
      throw new Error("Deleted order still exists in database");
    }

    res.json({
      success: true,
      message: "All admin orders update operations working correctly",
      tests: {
        create: "✓ Order created successfully",
        read: "✓ Created order found in database",
        update: "✓ Order updated successfully",
        verifyUpdate: "✓ Update was persisted to database",
        delete: "✓ Order deleted successfully",
        verifyDelete: "✓ Deletion was persisted to database",
      },
    });
  } catch (error) {
    console.error("Order update test failed:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Test failed",
    });
  }
};
