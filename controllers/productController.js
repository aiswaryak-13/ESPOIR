const Product = require('../models/productSchema');
const Category = require('../models/categorySchema');

const productInfo = async (req, res) => {
  try {
    if (req.session.admin) {
      const search = req.query.search?.trim() || '';
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const skip = (page - 1) * limit;

      const regex = new RegExp(search, 'i');
      const filter = search ? { productName: { $regex: regex } } : {};

      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .populate('category', 'name') 
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.render('admin/products', {
        products,
        currentPage: page,
        totalPages,
        search
      });
    } else {
      res.redirect('/admin'); 
    }
  } catch (error) {
    console.error("Error in productInfo controller:", error.message);
    res.status(500).render("admin/pageNotFound", { message: "Something went wrong while loading products." });
  }
};

const loadAddProduct = async(req,res) =>{
  try {
    if (req.session.admin) {
      const categories = await Category.find();
      res.render('admin/addProduct', { categories });
    } else {
      res.redirect('/admin/login');
    }
  } catch (error) {
    console.error("Error loading add product form:", error);
    res.status(500).render("admin/pageNotFound", { message: "Failed to load product form" });
  }
};

const addProduct = async(req,res)=>{
  
    try {
      const {
        productName,
        description,
        category,
        regularPrice,
        salePrice,
        productOffer,
        quantity,
        color,
        shape,
        style,
        status,
      } = req.body;
  
      const images = req.files.map((file) => file.filename);
  
      const product = new Product({
        productName,
        description,
        category,
        regularPrice,
        salePrice,
        productOffer,
        quantity,
        color,
        shape,
        style,
        status,
        productImage: images
      });
  
      await product.save();
      res.redirect('/admin/products');
    } catch (error) {
      console.error("Error while adding product:", error);
      res.redirect('/admin/pageNotFound');
    }
}

const loadEditProduct = async(req,res) =>{
  try {
    if(!req.session.admin){
      return res.redirect('/admin/login')
    }

    const productId = req.params.id;
    const product = await Product.findById(productId).populate('category');
    const categories = await Category.find();

    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('admin/editProduct', {
      product,
      categories,
      selectedCategory:product.category,

    });

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
}

const editProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      category,
      regularPrice,
      salePrice,
      productOffer,
      quantity,
      color,
      shape,
      style,
      status,
    } = req.body;

    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.redirect('/admin/products');
    }

    let updatedImages = product.productImage;
    if (req.files && req.files.length > 0) {
      updatedImages = req.files.map((file) => file.filename);
    }

    product.productName = productName;
    product.description = description;
    product.category = category;
    product.regularPrice = regularPrice;
    product.salePrice = salePrice;
    product.productOffer = productOffer;
    product.quantity = quantity;
    product.color = color;
    product.shape = shape;
    product.style = style;
    product.status = status;
    product.productImage = updatedImages;

    await product.save();

    res.redirect('/admin/products');
  } catch (error) {
    console.error("Error while editing product:", error);
    res.redirect('/admin/pageNotFound');
  }
};


const deleteProduct = async (req,res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    product.isBlocked = !product.isBlocked;
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error toggling product delete");
  }
}

module.exports = {
  productInfo,
  loadAddProduct,
  addProduct,
  loadEditProduct,
  editProduct,
  deleteProduct,


};
