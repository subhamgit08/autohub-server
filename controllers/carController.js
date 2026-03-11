import Purchase from "../models/Purchase.js"
import Car from "../models/Car.js"
import User from "../models/User.js"

export const addCar = async (req, res) => {

    try {

        const { brand, model, year, price} = req.body

        const newCar = new Car({
            brand,
            model,
            year,
            price,
            image: req.file.path,
            addedBy: req.user.id
        })

        await newCar.save()

        res.status(201).json(newCar)

    } catch (error) {

        console.log(error)
        res.status(500).json({ message: "Failed to add car" })

    }
}


export const getDealerCars = async (req, res) => {

    try {

        const cars = await Car.find({ addedBy: req.user.id })

        res.json(cars)

    } catch (error) {

        res.status(500).json({ message: "Error fetching cars" })
    }
}


export const getAllCars = async (req, res) => {

    try {

        const cars = await Car.find().populate("addedBy", "name")

        res.json(cars)

    } catch (error) {

        res.status(500).json({ message: "Error fetching cars" })
    }
}

export const deleteCar = async (req, res) => {
    try {

        const car = await Car.findById(req.params.id)

        if (!car) {
            return res.status(404).json({ message: "Car not found" })
        }

        if (car.addedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" })
        }

        await Car.findByIdAndDelete(req.params.id)

        res.json({ message: "Car deleted" })

    } catch (error) {
        res.status(500).json({ message: "Delete failed" })
    }
}

export const updateCar = async (req, res) => {

    try {

        const car = await Car.findById(req.params.id)

        if (!car) {
            return res.status(404).json({ message: "Car not found" })
        }

        car.brand = req.body.brand || car.brand
        car.model = req.body.model || car.model
        car.year = req.body.year || car.year
        car.price = req.body.price || car.price

        if (req.file) {
            car.image = req.file.path   
        }

        await car.save()

        res.json(car)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const buyCar = async (req, res) => {

    try {

        const userId = req.user._id
        const carId = req.params.id

        const user = await User.findById(userId)
        const car = await Car.findById(carId)

        if (!car) {
            return res.status(404).json({ message: "Car not found" })
        }

        if (user.walletBalance < car.price) {
            return res.status(400).json({ message: "Insufficient balance" })
        }

        user.walletBalance -= car.price
        await user.save()

        const purchase = await Purchase.create({
            customer: userId,
            car: car._id,
            dealer: car.addedBy
        })

        res.status(200).json({
            message: "Car purchased successfully",
            purchase
        })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

export const getCustomerPurchases = async (req, res) => {

    try {

        const purchases = await Purchase
            .find({ customer: req.user._id })
            .populate("car")
            .populate("dealer", "name")

        res.json(purchases)

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

export const sellCar = async (req, res) => {

    try {

        const userId = req.user._id
        const carId = req.params.id

        const purchase = await Purchase.findOne({
            customer: userId,
            car: carId
        })

        if (!purchase) {
            return res.status(400).json({
                message: "You don't own this car"
            })
        }

        const car = await Car.findById(carId)
        const user = await User.findById(userId)

        user.walletBalance += car.price

        await user.save()

        await purchase.deleteOne()

        res.json({ message: "Car sold successfully" })

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}