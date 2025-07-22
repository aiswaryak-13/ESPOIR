const User = require('../models/userSchema');

const customerInfo = async(req,res)=>{
  try {
    let search = "";
    if(req.query.search){
      search = req.query.search;
    }

    let page=1;
    if(req.query.page){
      page = req.query.page;
    }

    const limit=3;
    const UserData = await User.find({
      isAdmin:false,
      $or:[
        {name:{$regex:".*"+search+".*"}},
        {email:{$regex:".*"+search+".*"}}
      ],
    })
    .limit(limit*1)
    .skip((page-1)*limit)
    .exec();

    const status = req.query.status || "all";
    if (status === 'active') {
      query.isBlocked = false;
    } else if (status === 'blocked') {
      query.isBlocked = true;
    }

    const count = await User.find({
    isAdmin:false,
      $or:[
        {name:{$regex:".*"+search+".*"}},
        {email:{$regex:".*"+search+".*"}}
      ],

    }).countDocuments();

    

    res.render('admin/customerManagement', {
      users: UserData,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      search,
      status
    });


  } catch (error) {
    res.redirect('/pageNotFound');
  }
}

const customerBlocked = async(req,res)=>{
  try{

    let id = req.query.id;
    await User.updateOne({_id:id},{$set:{isBlocked:true}});
    res.redirect('/admin/customers');
  }catch(error){
    res.redirect('/pageNotFound');
  }
}

const customerUnblocked = async(req,res)=>{
  try{

    let id = req.query.id;
    await User.updateOne({_id:id},{$set:{isBlocked:false}});
    res.redirect('/admin/customers');
  }catch(error){
    res.redirect('/pageNotFound');
  }
}

module.exports = {
  customerInfo,
  customerBlocked,
  customerUnblocked,

}