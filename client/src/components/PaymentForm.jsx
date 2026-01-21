import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { toggleOrderStep } from "../store/slices/orderSlice.js";
import { clearCart } from "../store/slices/cartSlice.js";

const PaymentForm = () => {
  const clientSecret = useSelector((state) => state.order.paymentIntent);
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (error) {
      setErrorMessage(error);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("payment successful.");
      navigate("/");
    }

    setIsProcessing(false);
    dispatch(toggleOrderStep());
    dispatch(clearCart());
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="glass-panel">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Card Payment
          </h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Card Details *
          </label>
          <div className="px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none text-foreground">
            <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-6 p-4 bg-secondary/50 rounded-lg">
          <Lock className="w-5 h-5 text-green-500" />
          <span className="text-sm text-muted-foreground">
            Your card information is encrypted and secure.
          </span>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex justify-center items-center gap-2 w-full py-3 gradient-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth font-semibold"
        >
          {isProcessing ? (
            <>
              <div
                className={`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin`}
              />
              <span className="text-white">Payment Processing ...</span>
            </>
          ) : (
            "Complete Payment"
          )}
        </button>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
        )}
      </form>
    </>
  );
};

export default PaymentForm;
