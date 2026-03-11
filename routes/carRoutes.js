import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import {
    addCar,
    getDealerCars,
    getAllCars,
    deleteCar,
    updateCar,
    buyCar,
    getCustomerPurchases,
    sellCar
} from "../controllers/carController.js"
import upload from "../middleware/upload.js"

const router = express.Router()

router.post(
    "/add",
    protectRoute,
    upload.single("image"),
    addCar
)

router.get("/dealer", protectRoute, getDealerCars)

router.get("/all", getAllCars)

router.delete("/delete/:id", protectRoute,deleteCar)
router.put("/update/:id", protectRoute,upload.single("image"),updateCar)

router.post("/buy/:id", protectRoute, buyCar)

router.get("/purchases", protectRoute, getCustomerPurchases)

router.post("/sell/:id", protectRoute, sellCar)

export default router