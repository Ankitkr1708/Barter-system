import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function PostItem() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    bookType: "",
  });
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setMessage("You can only upload up to 5 images.");
      return;
    }
    setSelectedImages(files);

    // Generate previews for each file
    try {
      const previews = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
      setImagePreviews(previews);
    } catch (error) {
      console.error("Error loading image previews:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please login to post an item");
        return;
      }

      // Validate required fields.
      if (
        !formData.title ||
        !formData.category ||
        !formData.description ||
        (formData.category === "books" && !formData.bookType) ||
        selectedImages.length === 0
      ) {
        setMessage("Please fill in all required fields and select up to 5 images");
        return;
      }

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      // Append each image file to the FormData
      selectedImages.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const res = await fetch("http://localhost:5000/api/items/postItem", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to post item");
      }

      setMessage("Item posted successfully!");

      // Reset fields after success
      setFormData({
        title: "",
        category: "",
        description: "",
        bookType: "",
      });
      setSelectedImages([]);
      setImagePreviews([]);

      // Redirect after success
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Submission error:", error);
      setMessage(error.message || "An error occurred while posting the item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <Link to="/">
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: "150px", height: "100px" }}
            />
          </Link>
        </div>
      </header>

      <main>
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Posting item...</p>
          </div>
        )}
        <section className="post-item-container">
          <div className="post-item-form">
            <h2>Post an Item for Swap</h2>
            <p>Share details about your item to find great swap offers!</p>

            <form id="post-item-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="item-title">Item Title</label>
                <input
                  type="text"
                  id="item-title"
                  name="title"
                  required
                  placeholder="e.g., Vintage Book Collection"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength="15"
                />
              </div>

              <div className="form-group">
                <label htmlFor="item-category">Category</label>
                <select
                  id="item-category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a Category</option>
                  <option value="books">Books</option>
                  <option value="labReport">Lab Report</option>
                  <option value="notes">Notes</option>
                  <option value="food">Food</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="item-description">Description</label>
                <textarea
                  id="item-description"
                  name="description"
                  rows="4"
                  required
                  placeholder="Describe your item, including bookType, age, and any other relevant details."
                  value={formData.description}
                  onChange={handleChange}
                  maxLength="150"
                ></textarea>
              </div>

              {formData.category === "books" && (
                <div className="form-group">
                  <label htmlFor="item-bookType">Book Type</label>
                  <select
                    id="item-bookType"
                    name="bookType"
                    required
                    value={formData.bookType}
                    onChange={handleChange}
                  >
                    <option value="">Select Book Type</option>
                    <option value="Story Book">Story Book</option>
                    <option value="Textbook">Textbook</option>
                    <option value="Exam">Exam</option>
                    <option value="Novel">Novel</option>
                    <option value="Guidebook">Guidebook</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="item-image">Upload Images</label>
                <div className="image-upload-container">
                  <div className="image-upload-area">
                    {imagePreviews.length > 0 ? (
                      imagePreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Preview ${index}`}
                          className="image-preview"
                          style={{ maxWidth: "200px", maxHeight: "200px", marginRight: "10px" }}
                        />
                      ))
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-upload-alt"></i>
                        <p>Click to select images</p>
                      </>
                    )}
                    <input
                      type="file"
                      id="item-image"
                      name="image"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      required
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      className="btn upload-btn"
                      onClick={() =>
                        document.getElementById("item-image").click()
                      }
                    >
                      Choose Images
                    </button>
                  </div>
                </div>
                <small>You can only upload up to 5 images.</small>
              </div>

              <button type="submit" className="btn submit-btn">
                Post Item
              </button>

              {message && (
                <div
                  className={`auth-message ${
                    message.includes("success") ? "success" : "error"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 eBarter. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="#">About Us</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="#">Terms of Service</Link>
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
}

export default PostItem;
