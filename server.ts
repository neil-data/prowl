import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "orders.json");

// Ensure data directory and orders database file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf-8");
}

interface Order {
  id: string;
  email: string;
  items: any[];
  config: {
    finish: string;
    upholstery: string;
    addons: string[];
    whiteGloveService: boolean;
  };
  pricing: {
    subtotal: number;
    assemblyCost: number;
    estimatedTax: number;
    finalTotal: number;
  };
  status: "ORDERED" | "CAD_VERIFIED" | "FABRICATION" | "TRANSIT" | "INSTALLED";
  statusHistory: { status: string; timestamp: string; desc: string }[];
  currentCoordinates: { lat: number; lng: number };
  transitSpeed: number; // km/h
  transitProgress: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

// Read database helper
function readOrders(): Order[] {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

// Write database helper
function writeOrders(orders: Order[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

// Sse stream list for active real-time subscribers
let activeSseClients: { orderId: string; res: any }[] = [];

function notifySseClients(orderId: string, data: Order) {
  const clients = activeSseClients.filter((c) => c.orderId === orderId);
  clients.forEach((c) => {
    try {
      c.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      console.error("Failed to notify SSE client", e);
    }
  });
}

// Route mapping coordinates simulation
const COORDINATES = {
  START: { name: "Mumbai Foundry HQ", lat: 19.0760, lng: 72.8777 },
  CHECKPOINT_PUNE: { name: "Pune Engineering Hub", lat: 18.5204, lng: 73.8567 },
  CLIENT: { name: "Destination Delivery Site", lat: 12.9716, lng: 77.5946 }, // Bangalore
};

// Calculate real-time coordinates during Transit
function calculateCoordinates(progress: number) {
  // Move from Pune (Checkpoint) near half-way, then to Bangalore Client coordinates (interpolated)
  const startLat = COORDINATES.CHECKPOINT_PUNE.lat;
  const startLng = COORDINATES.CHECKPOINT_PUNE.lng;
  const endLat = COORDINATES.CLIENT.lat;
  const endLng = COORDINATES.CLIENT.lng;

  const lat = startLat + (endLat - startLat) * (progress / 100);
  const lng = startLng + (endLng - startLng) * (progress / 100);
  return { lat, lng };
}

// Auto-advance orders to simulate physical transit sequences like Amazon
function updateSimulatedOrderStates(order: Order): boolean {
  const now = new Date();
  const elapsedMs = now.getTime() - new Date(order.createdAt).getTime();
  const elapsedSec = elapsedMs / 1000;

  let updated = false;
  let statusBefore = order.status;

  // Let's define visual speed:
  // Level 1: ORDERED: 0s - 12s
  // Level 2: CAD_VERIFIED: 12s - 25s
  // Level 3: FABRICATION: 25s - 45s
  // Level 4: TRANSIT: 45s - 85s
  // Level 5: INSTALLED: >85s (Stable)

  if (elapsedSec >= 85) {
    if (order.status !== "INSTALLED") {
      order.status = "INSTALLED";
      order.transitProgress = 100;
      order.currentCoordinates = COORDINATES.CLIENT;
      order.transitSpeed = 0;
      if (!order.statusHistory.some((h) => h.status === "INSTALLED")) {
        order.statusHistory.push({
          status: "INSTALLED",
          timestamp: new Date().toISOString(),
          desc: "Secure site physical structural verification. Anchor bolts torque-checked. Prometheus Telemetry synced.",
        });
      }
      updated = true;
    }
  } else if (elapsedSec >= 45) {
    if (order.status !== "TRANSIT") {
      order.status = "TRANSIT";
      if (!order.statusHistory.some((h) => h.status === "TRANSIT")) {
        order.statusHistory.push({
          status: "TRANSIT",
          timestamp: new Date().toISOString(),
          desc: "White-glove heavy cargo carrier locked & loaded. Active GPS satellite tracking online.",
        });
      }
      updated = true;
    }
    // Interpolate progress from 0 to 100 during transit duration (45s to 85s -> 40 seconds)
    const transitElapsed = elapsedSec - 45;
    const progress = Math.min(100, Math.floor((transitElapsed / 40) * 100));
    order.transitProgress = progress;
    order.currentCoordinates = calculateCoordinates(progress);
    order.transitSpeed = Math.floor(60 + Math.random() * 15); // Dynamic truck velocity
    updated = true;
  } else if (elapsedSec >= 25) {
    if (order.status !== "FABRICATION") {
      order.status = "FABRICATION";
      order.currentCoordinates = COORDINATES.CHECKPOINT_PUNE;
      order.transitProgress = 0;
      order.transitSpeed = 0;
      if (!order.statusHistory.some((h) => h.status === "FABRICATION")) {
        order.statusHistory.push({
          status: "FABRICATION",
          timestamp: new Date().toISOString(),
          desc: "Heavy carbon CNC milling chambers active. Cerakote gold layer baked at 350°F.",
        });
      }
      updated = true;
    }
  } else if (elapsedSec >= 12) {
    if (order.status !== "CAD_VERIFIED") {
      order.status = "CAD_VERIFIED";
      order.currentCoordinates = COORDINATES.CHECKPOINT_PUNE;
      order.transitProgress = 0;
      order.transitSpeed = 0;
      if (!order.statusHistory.some((h) => h.status === "CAD_VERIFIED")) {
        order.statusHistory.push({
          status: "CAD_VERIFIED",
          timestamp: new Date().toISOString(),
          desc: "Biomechanical footprint modeling parsed. Alignment margins within 0.02 micron tolerance.",
        });
      }
      updated = true;
    }
  }

  if (updated) {
    order.updatedAt = now.toISOString();
  }

  return updated;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route - Place continuous order
  app.post("/api/orders", (req, res) => {
    const { email, items, config, pricing } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Client email is required" });
    }

    const orderId = `PRW-${2026 + Math.floor(Math.random() * 2)}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const newOrder: Order = {
      id: orderId,
      email,
      items: items || [],
      config: {
        finish: config?.finish || "raw-steel",
        upholstery: config?.upholstery || "standard-black",
        addons: config?.addons || [],
        whiteGloveService: config?.whiteGloveService !== false,
      },
      pricing: {
        subtotal: pricing?.subtotal || 0,
        assemblyCost: pricing?.assemblyCost || 0,
        estimatedTax: pricing?.estimatedTax || 0,
        finalTotal: pricing?.finalTotal || 0,
      },
      status: "ORDERED",
      statusHistory: [
        {
          status: "ORDERED",
          timestamp: new Date().toISOString(),
          desc: "Secure custom specification locked. Raw carbon alloy earmarked at central foundry.",
        },
      ],
      currentCoordinates: COORDINATES.START,
      transitSpeed: 0,
      transitProgress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orders = readOrders();
    orders.push(newOrder);
    writeOrders(orders);

    res.json({ success: true, order: newOrder });
  });

  // API Route - Browse all matching / active tracked orders
  app.get("/api/orders", (req, res) => {
    const emailStr = req.query.email as string;
    let orders = readOrders();
    
    // Simulate progression on all fetched orders before returning
    let anyUpdated = false;
    orders = orders.map((o) => {
      const isChanged = updateSimulatedOrderStates(o);
      if (isChanged) {
        anyUpdated = true;
        notifySseClients(o.id, o);
      }
      return o;
    });

    if (anyUpdated) {
      writeOrders(orders);
    }

    if (emailStr) {
      const filtered = orders.filter(
        (o) => o.email.toLowerCase() === emailStr.toLowerCase()
      );
      return res.json(filtered);
    }

    res.json(orders);
  });

  // API Route - Find order details
  app.get("/api/orders/:id", (req, res) => {
    const orderId = req.params.id;
    let orders = readOrders();
    const orderIdx = orders.findIndex((o) => o.id === orderId);

    if (orderIdx === -1) {
      return res.status(404).json({ error: "Order details not found" });
    }

    const order = orders[orderIdx];
    const updated = updateSimulatedOrderStates(order);
    if (updated) {
      writeOrders(orders);
      notifySseClients(orderId, order);
    }

    res.json(order);
  });

  // API Route - Simulate/Force advance tracking to next step immediately
  app.post("/api/orders/:id/simulate", (req, res) => {
    const orderId = req.params.id;
    const { targetStatus } = req.body;
    let orders = readOrders();
    const orderIdx = orders.findIndex((o) => o.id === orderId);

    if (orderIdx === -1) {
      return res.status(404).json({ error: "Order specification not found" });
    }

    const order = orders[orderIdx];
    const statuses: Order["status"][] = [
      "ORDERED",
      "CAD_VERIFIED",
      "FABRICATION",
      "TRANSIT",
      "INSTALLED",
    ];

    let nextStatus: Order["status"] = order.status;
    if (targetStatus && statuses.includes(targetStatus)) {
      nextStatus = targetStatus;
    } else {
      const currIdx = statuses.indexOf(order.status);
      if (currIdx < statuses.length - 1) {
        nextStatus = statuses[currIdx + 1];
      }
    }

    order.status = nextStatus;
    order.updatedAt = new Date().toISOString();

    const descriptions = {
      ORDERED: "Specification locked. Foundry ingot reserves committed.",
      CAD_VERIFIED: "Biomechanical load vectors and clearances verified. Alignment check complete.",
      FABRICATION: "Cerakote application and robotics-driven weld audits active.",
      TRANSIT: "White-glove logistic carrier dispatched with live radar alignment GPS.",
      INSTALLED: "Seismic floor anchors torqued. Biosensor networks calibrated and declared live.",
    };

    if (!order.statusHistory.some((h) => h.status === nextStatus)) {
      order.statusHistory.push({
        status: nextStatus,
        timestamp: new Date().toISOString(),
        desc: descriptions[nextStatus],
      });
    }

    if (nextStatus === "TRANSIT") {
      order.transitProgress = order.transitProgress || 20;
      order.currentCoordinates = calculateCoordinates(order.transitProgress);
      order.transitSpeed = 74;
    } else if (nextStatus === "INSTALLED") {
      order.transitProgress = 100;
      order.currentCoordinates = COORDINATES.CLIENT;
      order.transitSpeed = 0;
    } else {
      order.transitProgress = 0;
      order.transitSpeed = 0;
    }

    writeOrders(orders);
    notifySseClients(orderId, order);

    res.json({ success: true, order });
  });

  // SSE Live Feed Link
  app.get("/api/orders/:id/live", (req, res) => {
    const orderId = req.params.id;
    
    // Set headers for EventStream protocol
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // Find and update current simulated status immediately
    const orders = readOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      updateSimulatedOrderStates(order);
      writeOrders(orders);
      res.write(`data: ${JSON.stringify(order)}\n\n`);
    }

    // Register active subscriber
    const client = { orderId, res };
    activeSseClients.push(client);

    req.on("close", () => {
      activeSseClients = activeSseClients.filter((c) => c !== client);
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
