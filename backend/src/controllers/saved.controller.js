import SavedItem from '../models/SavedItem.js';

export const saveItem = async (req, res) => {
    try {
        const { item_type, item_id } = req.body;

        const savedItem = await SavedItem.create({
            user_id: req.user._id,
            item_type,
            item_id,
        });

        return res.status(201).json({
            status: 'success',
            message: 'Item saved successfully',
            data: savedItem,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });

    }
};

export const getSavedItems = async (req, res) => {
    try {
        const savedItems = await SavedItem.find({
            user_id: req.user._id,
        }).sort({ created_at: -1 });

        return res.status(200).json({
            status: 'success',
            message: 'Saved items retrieved successfully',
            data: savedItems,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};

export const deleteSavedItem = async (req, res) => {
  try {
    const savedItem = await SavedItem.findById(req.params.id);

    if (!savedItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Saved item not found',
      });
    }

    if (savedItem.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not allowed to delete this saved item',
      });
    }

    await SavedItem.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Saved item deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};