import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import "@/styles/select-zindex-workaround.css";
import { useNavigate } from "react-router-dom";
import { getSessionIdFromCookie } from '../../lib/utils';
import { apiUrl } from '../../config';
import { processImageUpload } from '../../lib/imageUpload';

interface Product {
  name: string;
  description: string;
  image_url: string;
  category: string;
  in_stock: boolean | null;
  price: string;
}

interface UploadedImage {
  preview: string;
  base64: string;
  fileName: string;
  fileSize: number;
}

const AddProductForm: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    image_url: "",
    category: "",
    in_stock: null,
    price: "",
  });

  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [uploadError, setUploadError] = useState<string>("");

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    const result = await processImageUpload(file);

    if (result.error) {
      setUploadError(result.error);
      setUploadedImage(null);
      return;
    }

    setUploadedImage({
      preview: result.preview,
      base64: result.base64,
      fileName: result.fileName,
      fileSize: result.fileSize,
    });

    // Set image_url to base64 for backend
    setProduct((prev) => ({ ...prev, image_url: result.base64 }));
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadError("");
    setProduct((prev) => ({ ...prev, image_url: "" }));
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...product,
      in_stock: product.in_stock === true,
      price: parseFloat(product.price),
    };

    try {
      const res = await fetch(apiUrl("/api/v1/products"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getSessionIdFromCookie()}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to create product:", await res.text());
      } else {
        const data = await res.json();
        if (data && data.product_id) {
          window.location.href = `/products/${data.product_id}`;
        } else {
          console.log("Product created, but no ID returned:", data);
        }
        // Reset form if needed
      }
    } catch (err) {
      console.error("Error submitting product:", err);
    }
  };

  return (
    <div
      data-testId="add-product-modal"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(31, 41, 55, 0.35)", // translucent dark overlay
        position: "fixed",
        inset: 0,
        zIndex: 100,
      }}
    >
      <div
        data-testId="add-product-modal-box"
        style={{
          maxWidth: "28rem", // ~448px
          width: "100%",
          background: "#fff",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          padding: "1.5rem",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            color: "#6b7280", // text-gray-500
            background: "white",
            borderRadius: "9999px",
            fontSize: "1.25rem", // slightly smaller
            fontWeight: 700,
            width: '1.75rem', // 28px
            height: '1.75rem', // 28px
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            zIndex: 10,
            border: "1.5px solid #888", // darker border
            cursor: "pointer",
            transition: "color 0.2s, border-color 0.2s",
          }}
          data-testId="add-product-modal-close"
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#000";
            e.currentTarget.style.borderColor = "#222";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#6b7280";
            e.currentTarget.style.borderColor = "#888";
          }}
          onClick={() => {
            if (typeof window !== "undefined" && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent("closeAddProductModal"));
            }
          }}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        <h3 className="text-2xl font-semibold text-center mb-6" data-testId="add-product-heading">
          Add new product
        </h3>

        <form
          className="flex flex-col"
          style={{ gap: "1rem" }}
          onSubmit={handleSubmit}
        >
          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left" data-testId="add-product-label-name">
              Product Name
            </label>
            <Input
              name="name"
              placeholder="e.g. Apple Macbook Pro"
              value={product.name}
              onChange={handleChange}
              className="w-full min-w-[280px] max-w-full px-4 py-2"
              data-testId="new_product_name"
              style={{
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: 400,
                border: '1.5px solid #d1d5db',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1.5px solid #6b7280';
                e.currentTarget.style.boxShadow = '0 0 0 1.5px #6b7280';
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1.5px solid #d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left" data-testId="add-product-label-description">
              Description
            </label>
            <Textarea
              name="description"
              placeholder="What does your product do?"
              value={product.description}
              onChange={handleChange}
              className="w-full min-w-[280px] max-w-full px-4 py-2"
              data-testId="new_product_description"
              style={{
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: 400,
                border: '1.5px solid #d1d5db',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1.5px solid #6b7280';
                e.currentTarget.style.boxShadow = '0 0 0 1.5px #6b7280';
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1.5px solid #d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left" data-testId="add-product-label-image">
              Product Image
            </label>

            {!uploadedImage ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                  data-testId="product-image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-block px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded hover:bg-gray-200"
                  style={{
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                  }}
                  data-testId="upload-button"
                >
                  Choose File
                </label>
                {uploadError && (
                  <div className="text-red-500 text-sm mt-1" data-testId="upload-error">
                    {uploadError}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border-2 border-gray-300 rounded p-2">
                  <img
                    src={uploadedImage.preview}
                    alt="Preview"
                    className="max-h-40 mx-auto"
                    data-testId="image-preview"
                  />
                </div>
                <div className="text-sm text-gray-600" data-testId="image-info">
                  <div data-testId="file-name">{uploadedImage.fileName}</div>
                  <div data-testId="file-size">{uploadedImage.fileSize} bytes</div>
                </div>
                <Button
                  type="button"
                  onClick={handleRemoveImage}
                  className="w-full text-red-600"
                  variant="outline"
                  data-testId="remove-image-button"
                >
                  Remove Image
                </Button>
              </div>
            )}
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left" data-testId="add-product-label-category">
              Category
            </label>
            <Input
              name="category"
              placeholder="e.g. Computers, Toys"
              value={product.category}
              onChange={handleChange}
              className="w-full min-w-[280px] max-w-full px-4 py-2"
              data-testId="new_product_category"
              style={{
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: 400,
                border: '1.5px solid #d1d5db',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1.5px solid #6b7280';
                e.currentTarget.style.boxShadow = '0 0 0 1.5px #6b7280';
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1.5px solid #d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left" data-testId="add-product-label-instock">
              In stock?
            </label>
            <Select
              value={
                product.in_stock === null
                  ? ""
                  : product.in_stock
                  ? "yes"
                  : "no"
              }
              onValueChange={(value) =>
                setProduct((prev) => ({
                  ...prev,
                  in_stock:
                    value === "yes"
                      ? true
                      : value === "no"
                      ? false
                      : null,
                }))
              }
            >
              <SelectTrigger
                className="w-full min-w-[280px] max-w-full px-4 py-2"
                style={{
                  border: '1.5px solid #d1d5db',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.currentTarget.style.border = '1.5px solid #6b7280';
                  e.currentTarget.style.boxShadow = '0 0 0 1.5px #6b7280';
                }}
                onBlur={e => {
                  e.currentTarget.style.border = '1.5px solid #d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes" data-testId="new_product_instock_yes" style={{ paddingLeft: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  Yes
                </SelectItem>
                <SelectItem value="no" data-testId="new_product_instock_no" style={{ paddingLeft: '0.5rem' }}>
                  No
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left" data-testId="add-product-label-price">
              Price
            </label>
            <Input
              name="price"
              placeholder="e.g. 2499.99"
              type="number"
              value={product.price}
              onChange={handleChange}
              className="w-full min-w-[280px] max-w-full px-4 py-2"
              data-testId="new_product_price"
              style={{
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: 400,
                border: '1.5px solid #d1d5db',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1.5px solid #6b7280';
                e.currentTarget.style.boxShadow = '0 0 0 1.5px #6b7280';
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1.5px solid #d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <Button
            type="submit"
            className="w-full text-black mt-2"
            style={{
              background: '#f3f4f6', // light grey
              color: '#111',
              border: '1.5px solid transparent',
              outline: 'none',
              transition: 'background 0.2s, border-color 0.2s, outline 0.2s',
              width: '100%',
              marginTop: '0.5rem',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#d1d5db'; // darker light grey
              e.currentTarget.style.border = '1.5px solid #000';
              e.currentTarget.style.outline = 'none'; // Only border, no outline
              e.currentTarget.style.outlineOffset = '0px';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.border = '1.5px solid transparent';
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.outlineOffset = '0px';
            }}
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
