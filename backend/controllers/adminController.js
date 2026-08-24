const User = require("../models/User");

const getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({
            role: "admin"
        });

        res.status(200).json(admins);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch admins"
        });
    }
};

const getAdminByID = async (req, res) => {
    try {
        const admin = await User.findOne({
            _id: req.params.id,
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        res.status(200).json(admin);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch admin"
        });
    }
};

const createAdmin = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password
        } = req.body;

        const admin = await User.create({
            first_name,
            last_name,
            email,
            password,
            role: "admin"
        });

        res.status(201).json(admin);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create admin"
        });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const admin = await User.findOneAndUpdate(
            {
                _id: req.params.id,
                role: "admin"
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        res.status(200).json(admin);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update admin"
        });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const admin = await User.findOneAndDelete({
            _id: req.params.id,
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        res.status(200).json({
            message: "Admin deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete admin"
        });
    }
};

module.exports = {
    getAllAdmins,
    getAdminByID,
    createAdmin,
    updateAdmin,
    deleteAdmin
};