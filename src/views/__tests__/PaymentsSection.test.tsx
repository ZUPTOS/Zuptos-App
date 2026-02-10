import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentsSection } from "@/views/editar-produto/checkout-editor/sections/PaymentsSection";

function PaymentsHarness() {
  const [acceptedDocuments, setAcceptedDocuments] = useState<Array<"cpf" | "cnpj">>(["cpf"]);
  const [paymentMethods, setPaymentMethods] = useState<Array<"card" | "boleto" | "pix">>(["card"]);
  const [couponEnabled, setCouponEnabled] = useState(false);
  const [discountCard, setDiscountCard] = useState("");
  const [discountPix, setDiscountPix] = useState("");
  const [discountBoleto, setDiscountBoleto] = useState("");
  const [installmentsLimit, setInstallmentsLimit] = useState("12");
  const [installmentsPreselected, setInstallmentsPreselected] = useState("12");
  const [boletoDueDays, setBoletoDueDays] = useState("3");
  const [pixExpireMinutes, setPixExpireMinutes] = useState("");
  const [showSellerDetail, setShowSellerDetail] = useState(false);
  const [preferenceRequireAddress, setPreferenceRequireAddress] = useState(false);

  return (
    <div>
      <PaymentsSection
        acceptedDocuments={acceptedDocuments}
        setAcceptedDocuments={setAcceptedDocuments}
        paymentMethods={paymentMethods}
        setPaymentMethods={setPaymentMethods}
        couponEnabled={couponEnabled}
        setCouponEnabled={setCouponEnabled}
        discountCard={discountCard}
        setDiscountCard={setDiscountCard}
        discountPix={discountPix}
        setDiscountPix={setDiscountPix}
        discountBoleto={discountBoleto}
        setDiscountBoleto={setDiscountBoleto}
        installmentsLimit={installmentsLimit}
        setInstallmentsLimit={setInstallmentsLimit}
        installmentsPreselected={installmentsPreselected}
        setInstallmentsPreselected={setInstallmentsPreselected}
        boletoDueDays={boletoDueDays}
        setBoletoDueDays={setBoletoDueDays}
        pixExpireMinutes={pixExpireMinutes}
        setPixExpireMinutes={setPixExpireMinutes}
        showSellerDetail={showSellerDetail}
        setShowSellerDetail={setShowSellerDetail}
        preferenceRequireAddress={preferenceRequireAddress}
        setPreferenceRequireAddress={setPreferenceRequireAddress}
      />

      <output data-testid="state">
        {JSON.stringify({
          acceptedDocuments,
          paymentMethods,
          couponEnabled,
          discountCard,
          discountPix,
          discountBoleto,
          installmentsLimit,
          installmentsPreselected,
          boletoDueDays,
          pixExpireMinutes,
          showSellerDetail,
          preferenceRequireAddress,
        })}
      </output>
    </div>
  );
}

describe("PaymentsSection", () => {
  it("permite alternar documentos/metodos e normaliza inputs", async () => {
    const user = userEvent.setup();
    render(<PaymentsHarness />);

    const state = () => JSON.parse(screen.getByTestId("state").textContent ?? "{}");

    expect(state().acceptedDocuments).toEqual(["cpf"]);
    expect(state().paymentMethods).toEqual(["card"]);

    await user.click(screen.getByRole("button", { name: "CNPJ" }));
    expect(state().acceptedDocuments).toEqual(["cpf", "cnpj"]);

    // Remove CPF (still leaves one doc)
    await user.click(screen.getByRole("button", { name: "CPF" }));
    expect(state().acceptedDocuments).toEqual(["cnpj"]);

    // Attempt to remove last doc (should keep previous value)
    await user.click(screen.getByRole("button", { name: "CNPJ" }));
    expect(state().acceptedDocuments).toEqual(["cnpj"]);

    await user.click(screen.getByRole("button", { name: "Pix" }));
    expect(state().paymentMethods).toEqual(["card", "pix"]);

    await user.click(screen.getByRole("button", { name: "Cartão de crédito" }));
    expect(state().paymentMethods).toEqual(["pix"]);

    const couponRow = screen.getByText("Cupom de desconto").closest("div");
    const couponToggle = couponRow?.querySelector("button");
    expect(couponToggle).toBeTruthy();
    await user.click(couponToggle as HTMLButtonElement);
    expect(state().couponEnabled).toBe(true);

    const discountInputs = screen.getAllByPlaceholderText("0") as HTMLInputElement[];
    expect(discountInputs.length).toBeGreaterThanOrEqual(3);
    const [cardDiscount, pixDiscount, boletoDiscount] = discountInputs;

    fireEvent.change(cardDiscount, { target: { value: "abc1234" } });
    expect(state().discountCard).toBe("100");

    fireEvent.change(pixDiscount, { target: { value: "" } });
    expect(state().discountPix).toBe("");

    fireEvent.change(boletoDiscount, { target: { value: "55" } });
    expect(state().discountBoleto).toBe("55");

    const installmentsLimitInput = screen.getByPlaceholderText("Limite de parcelas") as HTMLInputElement;
    fireEvent.change(installmentsLimitInput, { target: { value: "6x" } });
    expect(state().installmentsLimit).toBe("6");

    const installmentsPreselectedInput = screen.getByPlaceholderText("Parcela pré-selecionada") as HTMLInputElement;
    fireEvent.change(installmentsPreselectedInput, { target: { value: "3x" } });
    expect(state().installmentsPreselected).toBe("3");

    const boletoSelect = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(boletoSelect, { target: { value: "1" } });
    expect(state().boletoDueDays).toBe("1");

    await user.click(screen.getByLabelText(/Mostrar nomes do vendedor/i));
    expect(state().showSellerDetail).toBe(true);

    await user.click(screen.getByLabelText(/Solicitar endereço do comprador/i));
    expect(state().preferenceRequireAddress).toBe(true);
  });
});

