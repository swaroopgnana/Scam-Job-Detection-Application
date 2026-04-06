import History from "../models/History.js";

export const getUserHistory = async (req, res) => {
  try {
    const history = await History.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

export const deleteHistoryItem = async (req, res) => {
  try {
    const item = await History.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!item) {
      return res.status(404).json({ message: "History item not found" });
    }

    await item.deleteOne();

    res.status(200).json({ message: "History item deleted successfully" });
  } catch (error) {
    console.error("Delete history error:", error);
    res.status(500).json({ message: "Failed to delete history item" });
  }
};