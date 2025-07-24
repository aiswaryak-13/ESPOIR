const User = require('../models/userSchema');

const customerInfo = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const status = req.query.status || "all";

    const regex = new RegExp(search, "i");

    // Build base query
    const query = {
      isAdmin: false,
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } }
      ]
    };

    // Add status filter
    if (status === 'active') {
      query.isBlocked = false;
    } else if (status === 'blocked') {
      query.isBlocked = true;
    }

    //  Get filtered users with pagination and sorting
    const UserData = await User.find(query)
      .sort({ createdAt: -1 }) //  Descending order
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    // Total count for pagination
    const count = await User.countDocuments(query);

    res.render('admin/customerManagement', {
      users: UserData,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      search,
      status
    });

  } catch (error) {
    console.error(error);
    res.redirect('/pageNotFound');
  }
};

const customerBlocked = async (req, res) => {
  try {
    const id = req.query.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect('/admin/customers');
  } catch (error) {
    res.redirect('/pageNotFound');
  }
};

const customerUnblocked = async (req, res) => {
  try {
    const id = req.query.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect('/admin/customers');
  } catch (error) {
    res.redirect('/pageNotFound');
  }
};

module.exports = {
  customerInfo,
  customerBlocked,
  customerUnblocked
};
