import React, { useEffect, useState } from "react";
import "./Pay.scss";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import newRequest from "../../utils/newRequest";
import { useParams } from "react-router-dom";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";

const stripePromise = loadStripe(
  "pk_test_51QSLrWFoaanHjgImS38ke4Pk6KNj57TefmUMOgB45aw4R9hmQ16EsKDp3UhDrgKRXLWMHuOYioc7HNLmgNQQ9sbm00FpccxaID"
);

const Pay = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { id } = useParams(); // Ambil ID dari URL
  const gigId = id; // Pastikan id yang didapat adalah gigId yang benar

  useEffect(() => {
    const makeRequest = async () => {
      if (!gigId) {
        setErrorMessage("Terjadi kesalahan: gigId tidak ditemukan.");
        return;
      }

      try {
        const res = await newRequest.post(`/orders/payment-intent/${gigId}`, {
          gigId, // Kirim gigId secara eksplisit dalam request body
        });

        if (res.status === 409) {
          setErrorMessage("Pesanan anda masih tersimpan.");
          return;
        }

        setClientSecret(res.data.clientSecret);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 400) {
            setErrorMessage("gigId diperlukan. Silakan coba lagi.");
          } else if (err.response.status === 409) {
            setErrorMessage("Pesanan anda masih tersimpan.");
          } else {
            setErrorMessage("Terjadi kesalahan saat memproses pembayaran.");
          }
        } else {
          setErrorMessage("Koneksi bermasalah. Coba lagi nanti.");
        }
      }
    };

    makeRequest();
  }, [gigId]);

  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="pay">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {clientSecret && !errorMessage && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
};

export default Pay;
