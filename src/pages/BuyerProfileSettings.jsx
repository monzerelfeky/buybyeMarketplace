import React, { useState, useRef, useEffect, useCallback } from "react";
import "../styles/Header.css";
import "../styles/Buyer/BuyerProfileSettings.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function BuyerProfileSettings() {
    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
    const [baseline, setBaseline] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState("");

    const egyptGovernorates = [
        "Alexandria",
        "Aswan",
        "Asyut",
        "Beheira",
        "Beni Suef",
        "Cairo",
        "Dakahlia",
        "Damietta",
        "Faiyum",
        "Gharbia",
        "Giza",
        "Ismailia",
        "Kafr El Sheikh",
        "Luxor",
        "Matrouh",
        "Minya",
        "Monufia",
        "New Valley",
        "North Sinai",
        "Port Said",
        "Qalyubia",
        "Qena",
        "Red Sea",
        "Sharqia",
        "Sohag",
        "South Sinai",
        "Suez",
    ];

    const splitName = (name) => {
        const parts = (name || "").trim().split(/\s+/).filter(Boolean);
        return {
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" "),
        };
    };

    const buildName = (first, last) =>
        [first, last].map((s) => s.trim()).filter(Boolean).join(" ");

    const TABS = ["Personal", "Addresses"];
    const [activeTab, setActiveTab] = useState(TABS[0]);

    const [personal, setPersonal] = useState(
        baseline?.personal ?? { firstName: "", lastName: "", email: "", phone: "" }
    );
    const [personalErrors, setPersonalErrors] = useState({});
    const [personalSaving, setPersonalSaving] = useState(false);

    const [addresses, setAddresses] = useState(baseline?.addresses ?? []);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [addressEditingIndex, setAddressEditingIndex] = useState(null);
    const emptyAddress = {
        label: "Home",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        isDefault: false,
    };
    const [addressForm, setAddressForm] = useState(emptyAddress);
    const [addressSaving, setAddressSaving] = useState(false);
    const [confirmation, setConfirmation] = useState(null);

    const [cards, setCards] = useState(baseline?.cards ?? []);
    const [isCardModalOpen, setCardModalOpen] = useState(false);
    const [cardEditingIndex, setCardEditingIndex] = useState(null);
    const emptyCard = { brand: "Visa", last4: "", expMonth: "", expYear: "", isDefault: false };
    const [cardForm, setCardForm] = useState(emptyCard);
    const [cardSaving, setCardSaving] = useState(false);

    const [liveMessage, setLiveMessage] = useState("");
    const [savingAll, setSavingAll] = useState(false);

    const [addressErrors, setAddressErrors] = useState({});
    const [cardErrors, setCardErrors] = useState({});

    const mapAddressToLocal = (addr) => ({
        label: addr?.label || "Home",
        line1: addr?.addressLine1 || "",
        line2: addr?.addressLine2 || "",
        city: addr?.city || "",
        state: addr?.state || "",
        postalCode: addr?.postalCode || "",
        country: addr?.country || "",
        isDefault: Boolean(addr?.isDefault),
    });

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            setProfileError("Please login to manage your profile.");
            return;
        }

        const fetchProfile = async () => {
            setProfileLoading(true);
            setProfileError("");
            try {
                const [profileRes, addressRes] = await Promise.all([
                    fetch(`${API_BASE}/api/users/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE}/api/users/me/addresses`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (!profileRes.ok) throw new Error("Failed to load profile");
                const profile = await profileRes.json();
                const addressesRes = addressRes.ok ? await addressRes.json() : [];

                const nameParts = splitName(profile?.name || "");
                const nextPersonal = {
                    firstName: nameParts.firstName,
                    lastName: nameParts.lastName,
                    email: profile?.email || "",
                    phone: profile?.phone || "",
                };
                const nextAddresses = Array.isArray(addressesRes)
                    ? addressesRes.map(mapAddressToLocal)
                    : [];

                setPersonal(nextPersonal);
                setAddresses(nextAddresses);
                setBaseline({ personal: nextPersonal, addresses: nextAddresses, cards });
            } catch (err) {
                console.error("Profile fetch failed:", err);
                setProfileError("Failed to load profile details.");
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
        const handleAuthChange = () => fetchProfile();
        window.addEventListener("auth-changed", handleAuthChange);
        window.addEventListener("storage", handleAuthChange);
        return () => {
            window.removeEventListener("auth-changed", handleAuthChange);
            window.removeEventListener("storage", handleAuthChange);
        };
    }, [API_BASE]);

    const isPersonalDirty = () => {
        const base = baseline?.personal ?? { firstName: "", lastName: "", email: "", phone: "" };
        return JSON.stringify(base) !== JSON.stringify(personal);
    };
    const isAddressesDirty = () =>
        JSON.stringify(baseline?.addresses ?? []) !== JSON.stringify(addresses);
    const isCardsDirty = () =>
        JSON.stringify(baseline?.cards ?? []) !== JSON.stringify(cards);

    function persistAll(newState = null) {
        const toSave = newState ?? { personal, addresses, cards };
        setBaseline(toSave);
    }

    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }

    function validatePersonal() {
        const errs = {};

        if (!personal.firstName.trim()) {
            errs.firstName = "First name required";
        }
        if (!personal.lastName.trim()) {
            errs.lastName = "Last name required";
        }

        if (!personal.email.trim()) {
            errs.email = "Email required";
        } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(personal.email)) {
            errs.email = "Invalid email";
        }

        if (!personal.phone.trim()) {
            errs.phone = "Phone number required";
        } else if (!/^(\+?\d{10,15})$/.test(personal.phone)) {
            errs.phone = "Invalid phone number";
        }

        setPersonalErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function savePersonal() {
        if (!validatePersonal()) return;
        setPersonalSaving(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setLiveMessage("Please login to save changes");
                setPersonalSaving(false);
                return;
            }
            const res = await fetch(`${API_BASE}/api/users/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: buildName(personal.firstName, personal.lastName),
                    phone: personal.phone,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save personal info");

            const parts = splitName(data?.name || "");
            const nextPersonal = {
                firstName: parts.firstName,
                lastName: parts.lastName,
                email: data?.email || personal.email,
                phone: data?.phone || personal.phone,
            };
            setPersonal(nextPersonal);
            persistAll({ personal: nextPersonal, addresses, cards });
            setLiveMessage("Personal info saved");
            setTimeout(() => setLiveMessage(""), 2000);
        } catch (err) {
            console.error("Save personal info failed:", err);
            setLiveMessage("Failed to save personal info");
            setTimeout(() => setLiveMessage(""), 3000);
        } finally {
            setPersonalSaving(false);
        }
    }

    async function saveAddressesState(nextAddresses) {
        setAddresses(nextAddresses);
        persistAll({ personal, addresses: nextAddresses, cards });
        setLiveMessage("Addresses saved");
        setTimeout(() => setLiveMessage(""), 2000);
    }

    async function saveCardsState(nextCards) {
        setCardSaving(true);
        setCards(nextCards);
        await sleep(500);
        persistAll({ personal, addresses, cards: nextCards });
        setCardSaving(false);
        setLiveMessage("Payment methods saved");
        setTimeout(() => setLiveMessage(""), 2000);
    }

    function validateAddressForm() {
        const errs = {};

        if (!addressForm.line1.trim()) errs.line1 = "Address line 1 required";
        if (!addressForm.city.trim()) errs.city = "City required";
        if (!addressForm.postalCode.trim()) errs.postalCode = "Postal code required";

        setAddressErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function validateCardForm() {
        const errs = {};

        if (!/^[0-9]{4}$/.test(cardForm.last4)) errs.last4 = "Last 4 digits must be 4 numbers";
        if (!/^(0?[1-9]|1[0-2])$/.test(cardForm.expMonth)) errs.expMonth = "Invalid month";
        if (!/^[0-9]{4}$/.test(cardForm.expYear)) errs.expYear = "Invalid year";

        setCardErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function openAddressModalForNew() {
        setAddressForm({ ...emptyAddress, isDefault: addresses.length === 0 });
        setAddressEditingIndex(null);
        setAddressModalOpen(true);
    }
    function openAddressModalForEdit(idx) {
        setAddressForm({ ...addresses[idx] });
        setAddressEditingIndex(idx);
        setAddressModalOpen(true);
    }

    async function submitAddressModal() {
        if (!validateAddressForm()) return;
        setAddressSaving(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setLiveMessage("Please login to save addresses");
                setAddressSaving(false);
                return;
            }

            const payload = {
                label: addressForm.label,
                addressLine1: addressForm.line1,
                addressLine2: addressForm.line2,
                city: addressForm.city,
                state: addressForm.state,
                postalCode: addressForm.postalCode,
                country: addressForm.country,
                isDefault: addressForm.isDefault,
            };

            const url =
                addressEditingIndex != null
                    ? `${API_BASE}/api/users/me/addresses/${addressEditingIndex}`
                    : `${API_BASE}/api/users/me/addresses`;
            const method = addressEditingIndex != null ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save address");

            const nextAddresses = Array.isArray(data)
                ? data.map(mapAddressToLocal)
                : [];
            await saveAddressesState(nextAddresses);
            setAddressModalOpen(false);
            setAddressErrors({});
        } catch (err) {
            console.error("Save address failed:", err);
            setLiveMessage("Failed to save address");
            setTimeout(() => setLiveMessage(""), 3000);
        } finally {
            setAddressSaving(false);
        }
    }

    function openCardModalForNew() {
        setCardForm({ ...emptyCard, isDefault: cards.length === 0 });
        setCardEditingIndex(null);
        setCardModalOpen(true);
    }
    function openCardModalForEdit(idx) {
        setCardForm({ ...cards[idx] });
        setCardEditingIndex(idx);
        setCardModalOpen(true);
    }

    async function submitCardModal() {
        if (!validateCardForm()) return;

        const next = [...cards];
        if (cardEditingIndex != null) next[cardEditingIndex] = { ...cardForm };
        else next.push({ ...cardForm });

        if (cardForm.isDefault) {
            for (let i = 0; i < next.length; i++)
                next[i].isDefault = i === (cardEditingIndex ?? next.length - 1);
        }

        await saveCardsState(next);
        setCardModalOpen(false);
        setCardErrors({});
    }

    function confirmDeleteAddress(idx) {
        setConfirmation({ type: "delete-address", payload: idx });
    }
    function confirmDeleteCard(idx) {
        setConfirmation({ type: "delete-card", payload: idx });
    }

    async function handleConfirm() {
        if (!confirmation) return;
        if (confirmation.type === "delete-address") {
            const idx = confirmation.payload;
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    setLiveMessage("Please login to delete addresses");
                    setConfirmation(null);
                    return;
                }
                const res = await fetch(`${API_BASE}/api/users/me/addresses/${idx}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to delete address");
                const nextAddresses = Array.isArray(data)
                    ? data.map(mapAddressToLocal)
                    : [];
                await saveAddressesState(nextAddresses);
            } catch (err) {
                console.error("Delete address failed:", err);
                setLiveMessage("Failed to delete address");
                setTimeout(() => setLiveMessage(""), 3000);
            }
        }
        if (confirmation.type === "delete-card") {
            const idx = confirmation.payload;
            await saveCardsState(cards.filter((_, i) => i !== idx));
        }
        setConfirmation(null);
    }
    function cancelConfirm() {
        setConfirmation(null);
    }

    const closeAddressModal = useCallback(() => setAddressModalOpen(false), []);
    const closeCardModal = useCallback(() => setCardModalOpen(false), []);
    const closeConfirmModal = useCallback(() => setConfirmation(null), []);

    function useModalFocusTrap(
        isOpen,
        onClose,
        firstSelector = "input,button,select,textarea,a[href]"
    ) {
        const ref = useRef(null);
        useEffect(() => {
            if (!isOpen) return;
            const node = ref.current;
            if (!node) return;

            const first = node.querySelector(firstSelector);
            if (first && typeof first.focus === "function") first.focus();

            function handleKey(e) {
                if (e.key === "Escape") onClose();
                if (e.key === "Tab") {
                    const focusable = node.querySelectorAll(firstSelector);
                    if (!focusable.length) return;
                    const firstEl = focusable[0];
                    const lastEl = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl.focus();
                    } else if (!e.shiftKey && document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl.focus();
                    }
                }
            }

            document.addEventListener("keydown", handleKey);
            return () => document.removeEventListener("keydown", handleKey);
        }, [isOpen, onClose, firstSelector]);

        return ref;
    }

    const addressModalRef = useModalFocusTrap(isAddressModalOpen, closeAddressModal);
    const cardModalRef = useModalFocusTrap(isCardModalOpen, closeCardModal);
    const confirmModalRef = useModalFocusTrap(Boolean(confirmation), closeConfirmModal);

    const anyDirty = isPersonalDirty() || isAddressesDirty();

    useEffect(() => {
        if (!baseline) return;
        setPersonal(
            baseline.personal ?? {
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
            }
        );
        setAddresses(baseline.addresses ?? []);
        setCards(baseline.cards ?? []);
    }, [baseline]);

    function validateAll() {
        const personalErrs = {};
        if (!personal.firstName) personalErrs.firstName = "First name required";
        if (!personal.email) personalErrs.email = "Email required";
        else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(personal.email))
            personalErrs.email = "Invalid email";

        if (Object.keys(personalErrs).length) {
            setPersonalErrors(personalErrs);
            return personalErrs.firstName ?? personalErrs.email ?? "Personal info invalid";
        }

        for (let i = 0; i < addresses.length; i++) {
            const a = addresses[i];
            if (!a.line1) return `Address ${i + 1}: line 1 required`;
            if (!a.city) return `Address ${i + 1}: city required`;
            if (!a.postalCode) return `Address ${i + 1}: postal code required`;
        }

        return null;
    }

    async function saveAll() {
        if (savingAll) return;
        if (!anyDirty) return;

        const err = validateAll();
        if (err) {
            setLiveMessage(err);
            setTimeout(() => setLiveMessage(""), 3000);
            if (err.toLowerCase().includes("address")) setActiveTab("Addresses");
            else setActiveTab("Personal");
            return;
        }

        setSavingAll(true);
        try {
            if (isPersonalDirty()) {
                await savePersonal();
            } else {
                setLiveMessage("Settings saved");
                setTimeout(() => setLiveMessage(""), 2000);
            }
        } catch (e) {
            console.error("Failed saving all:", e);
            setLiveMessage("Failed to save settings");
            setTimeout(() => setLiveMessage(""), 3000);
        } finally {
            setSavingAll(false);
        }
    }

    useEffect(() => {
        function handleBeforeUnload(e) {
            const dirty =
                JSON.stringify(baseline?.personal ?? {}) !== JSON.stringify(personal) ||
                JSON.stringify(baseline?.addresses ?? []) !== JSON.stringify(addresses);

            if (dirty) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
            return undefined;
        }

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [personal, addresses, cards, baseline]);



    return (
        <>
            <Header />

            {/* Spacer so fixed header doesn't overlap content */}
            <div className="header-spacer" />

            <div className="bps-container">
                <div className="bps-header">
                    <h1 className="bps-title">Profile</h1>
                    <div aria-live="polite" className="bps-sr-only" role="status">
                        {liveMessage}
                    </div>
                </div>
                {profileLoading && (
                    <div className="bps-sub">Loading profile details...</div>
                )}
                {profileError && <div className="bps-error">{profileError}</div>}

                <div className="bps-layout">
                    <nav className="bps-sidebar" aria-label="Profile tabs">
                        <div className="bps-sidebar-panel">
                            {TABS.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    aria-selected={activeTab === t}
                                    role="tab"
                                    className={`bps-tab ${
                                        activeTab === t ? "bps-tab-active" : ""
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}

                            <div className="bps-save-all bps-save-all-wrapper">
                                <button
                                    onClick={saveAll}
                                    disabled={!anyDirty || savingAll}
                                    aria-busy={savingAll}
                                    className={`bps-btn bps-save-all-btn ${
                                        !anyDirty || savingAll ? "bps-disabled" : ""
                                    }`}
                                >
                                    {savingAll ? "Saving..." : "Save all changes"}
                                </button>
                            </div>

                        
                           
                           

                        </div>
                    </nav>

                    <main className="bps-main">
                        <div className="bps-panel">
                            {/* Personal tab */}
                            {activeTab === "Personal" && (
                                <section aria-labelledby="personal-heading">
                                    <h2
                                        id="personal-heading"
                                        className="bps-section-title"
                                    >
                                        Personal information
                                    </h2>

                                    <div className="bps-grid">
                                        <div>
                                            <label className="bps-label">First name</label>
                                            <input
                                                aria-label="First name"
                                                className="input-base"
                                                value={personal.firstName}
                                                onChange={(e) =>
                                                    setPersonal({
                                                        ...personal,
                                                        firstName: e.target.value,
                                                    })
                                                }
                                            />
                                            {personalErrors.firstName && (
                                                <div className="bps-error">
                                                    {personalErrors.firstName}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="bps-label">Last name</label>
                                            <input
                                                aria-label="Last name"
                                                className="input-base"
                                                value={personal.lastName}
                                                onChange={(e) =>
                                                    setPersonal({
                                                        ...personal,
                                                        lastName: e.target.value,
                                                    })
                                                }
                                            />
                                            {personalErrors.lastName && (
                                                <div className="bps-error">
                                                    {personalErrors.lastName}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bps-col-span-2">
                                            <label className="bps-label">Email</label>
                                            <input
                                                aria-label="Email"
                                                className="input-base"
                                                value={personal.email}
                                                disabled
                                                onChange={(e) =>
                                                    setPersonal({
                                                        ...personal,
                                                        email: e.target.value,
                                                    })
                                                }
                                            />
                                            {personalErrors.email && (
                                                <div className="bps-error">
                                                    {personalErrors.email}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bps-col-span-2">
                                            <label className="bps-label">Phone</label>
                                            <input
                                                aria-label="Phone"
                                                className="input-base"
                                                value={personal.phone}
                                                onChange={(e) =>
                                                    setPersonal({
                                                        ...personal,
                                                        phone: e.target.value,
                                                    })
                                                }
                                            />
                                            {personalErrors.phone && (
                                                <div className="bps-error">
                                                    {personalErrors.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bps-actions">
                                        <button
                                            onClick={savePersonal}
                                            disabled={!isPersonalDirty() || personalSaving}
                                            className={`bps-btn ${
                                                isPersonalDirty() && !personalSaving
                                                    ? "bps-primary"
                                                    : "bps-disabled"
                                            }`}
                                            aria-disabled={!isPersonalDirty()}
                                        >
                                            {personalSaving
                                                ? "Saving..."
                                                : "Save personal info"}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setPersonal(
                                                    baseline?.personal ?? {
                                                        firstName: "",
                                                        lastName: "",
                                                        email: "",
                                                        phone: "",
                                                    }
                                                )
                                            }
                                            className="bps-btn bps-outline"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* Addresses tab */}
                            {activeTab === "Addresses" && (
                                <section aria-labelledby="addresses-heading">
                                    <div className="bps-row-between">
                                        <h2
                                            id="addresses-heading"
                                            className="bps-section-title"
                                        >
                                            Addresses
                                        </h2>
                                        <div className="bps-inline-actions">
                                            <button
                                                onClick={openAddressModalForNew}
                                                className="bps-btn bps-outline"
                                            >
                                                + Add address
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAddresses([]);
                                                    persistAll({
                                                        personal,
                                                        addresses: [],
                                                        cards,
                                                    });
                                                    setLiveMessage("Addresses cleared");
                                                    setTimeout(
                                                        () => setLiveMessage(""),
                                                        2000
                                                    );
                                                }}
                                                className="bps-btn bps-outline"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    {addresses.length === 0 && (
                                        <div className="bps-empty">
                                            <div className="bps-empty-title">
                                                No addresses yet
                                            </div>
                                            <div className="bps-empty-sub">
                                                Add a delivery address to make checkout faster.
                                            </div>
                                            <button
                                                onClick={openAddressModalForNew}
                                                className="bps-btn bps-primary"
                                            >
                                                Add address
                                            </button>
                                        </div>
                                    )}

                                    <div className="bps-stack">
                                        {addresses.map((a, idx) => (
                                            <div key={idx} className="bps-item">
                                                <div>
                                                    <div className="bps-strong">
                                                        {a.label}{" "}
                                                        {a.isDefault && (
                                                            <span className="bps-default-badge">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="bps-sm">
                                                        {a.line1}
                                                        {a.line2 ? `, ${a.line2}` : ""}
                                                    </div>
                                                    <div className="bps-sm">
                                                        {a.city}, {a.state} {a.postalCode} —{" "}
                                                        {a.country}
                                                    </div>
                                                </div>
                                                <div className="bps-inline-gap">
                                                    <button
                                                        onClick={() =>
                                                            openAddressModalForEdit(idx)
                                                        }
                                                        className="btn-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            confirmDeleteAddress(idx)
                                                        }
                                                        className="btn-sm btn-danger"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Payments tab */}
                            {activeTab === "Payments" && (
                                <section aria-labelledby="payments-heading">
                                    <div className="bps-row-between">
                                        <h2
                                            id="payments-heading"
                                            className="bps-section-title"
                                        >
                                            Payment methods
                                        </h2>
                                        <div className="bps-inline-actions">
                                            <button
                                                onClick={openCardModalForNew}
                                                className="bps-btn bps-outline"
                                            >
                                                + Add card
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCards([]);
                                                    persistAll({
                                                        personal,
                                                        addresses,
                                                        cards: [],
                                                    });
                                                    setLiveMessage(
                                                        "Payment methods cleared"
                                                    );
                                                    setTimeout(
                                                        () => setLiveMessage(""),
                                                        2000
                                                    );
                                                }}
                                                className="bps-btn bps-outline"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    {cards.length === 0 && (
                                        <div className="bps-empty">
                                            <div className="bps-empty-title">
                                                No saved cards
                                            </div>
                                            <div className="bps-empty-sub">
                                                Add a card to speed up checkout.
                                            </div>
                                            <button
                                                onClick={openCardModalForNew}
                                                className="bps-btn bps-primary"
                                            >
                                                Add card
                                            </button>
                                        </div>
                                    )}

                                    <div className="bps-stack">
                                        {cards.map((c, idx) => (
                                            <div key={idx} className="bps-item">
                                                <div>
                                                    <div className="bps-strong">
                                                        {c.brand} •••• {c.last4}{" "}
                                                        {c.isDefault && (
                                                            <span className="bps-default-badge">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="bps-sm">
                                                        Exp: {c.expMonth}/{c.expYear}
                                                    </div>
                                                </div>
                                                <div className="bps-inline-gap">
                                                    <button
                                                        onClick={() =>
                                                            openCardModalForEdit(idx)
                                                        }
                                                        className="btn-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            confirmDeleteCard(idx)
                                                        }
                                                        className="btn-sm btn-danger"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </main>
                </div>

                {isAddressModalOpen && (
                    <Modal
                        roleLabel="Address form"
                        onClose={closeAddressModal}
                        refNode={addressModalRef}
                    >
                        <div>
                            <h3 className="bps-section-title">
                                {addressEditingIndex != null
                                    ? "Edit address"
                                    : "Add address"}
                            </h3>

                            <div className="bps-grid">
                                <label className="bps-col-span-2">
                                    Label
                                    <input
                                        className="input-base"
                                        value={addressForm.label}
                                        onChange={(e) =>
                                            setAddressForm((prev) => ({
                                                ...prev,
                                                label: e.target.value,
                                            }))
                                        }
                                    />
                                </label>

                                <label>
                                    Postal code
                                    <input
                                        className="input-base"
                                        value={addressForm.postalCode}
                                        onChange={(e) =>
                                            setAddressForm((prev) => ({
                                                ...prev,
                                                postalCode: e.target.value,
                                            }))
                                        }
                                    />
                                    {addressErrors.postalCode && (
                                        <div className="bps-error">
                                            {addressErrors.postalCode}
                                        </div>
                                    )}
                                </label>

                                <label className="bps-col-span-2">
                                    Address line 1
                                    <input
                                        className="input-base"
                                        value={addressForm.line1}
                                        onChange={(e) =>
                                            setAddressForm((prev) => ({
                                                ...prev,
                                                line1: e.target.value,
                                            }))
                                        }
                                    />
                                    {addressErrors.line1 && (
                                        <div className="bps-error">
                                            {addressErrors.line1}
                                        </div>
                                    )}
                                </label>

                                <label>
                                    City
                                    <select
                                        className="input-base"
                                        value={addressForm.city}
                                        onChange={(e) =>
                                            setAddressForm((prev) => ({
                                                ...prev,
                                                city: e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">Select a city</option>
                                        {egyptGovernorates.map((gov) => (
                                            <option key={gov} value={gov}>
                                                {gov}
                                            </option>
                                        ))}
                                    </select>
                                    {addressErrors.city && (
                                        <div className="bps-error">
                                            {addressErrors.city}
                                        </div>
                                    )}
                                </label>

                                <label>
                                    State / Region
                                    <input
                                        className="input-base"
                                        value={addressForm.state}
                                        onChange={(e) =>
                                            setAddressForm((prev) => ({
                                                ...prev,
                                                state: e.target.value,
                                            }))
                                        }
                                    />
                                </label>

                                <label className="bps-col-span-2 bps-checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={addressForm.isDefault}
                                        onChange={(e) =>
                                            setAddressForm((prev) => ({
                                                ...prev,
                                                isDefault: e.target.checked,
                                            }))
                                        }
                                    />{" "}
                                    Set as default
                                </label>
                            </div>

                            <div className="bps-actions">
                                <button
                                    onClick={submitAddressModal}
                                    disabled={addressSaving}
                                    className={`bps-btn ${
                                        !addressSaving ? "bps-primary" : "bps-disabled"
                                    }`}
                                >
                                    {addressSaving ? "Saving..." : "Save address"}
                                </button>
                                <button
                                    onClick={closeAddressModal}
                                    className="bps-btn bps-outline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {isCardModalOpen && (
                    <Modal
                        roleLabel="Card form"
                        onClose={closeCardModal}
                        refNode={cardModalRef}
                    >
                        <div>
                            <h3 className="bps-section-title">
                                {cardEditingIndex != null ? "Edit card" : "Add card"}
                            </h3>

                            <div className="bps-grid">
                                <label>
                                    Brand
                                    <select
                                        className="input-base"
                                        value={cardForm.brand}
                                        onChange={(e) =>
                                            setCardForm((prev) => ({
                                                ...prev,
                                                brand: e.target.value,
                                            }))
                                        }
                                    >
                                        <option>Visa</option>
                                        <option>Mastercard</option>
                                        <option>Amex</option>
                                    </select>
                                </label>

                                <label>
                                    Last 4 digits
                                    <input
                                        className="input-base"
                                        value={cardForm.last4}
                                        onChange={(e) =>
                                            setCardForm((prev) => ({
                                                ...prev,
                                                last4: e.target.value,
                                            }))
                                        }
                                    />
                                    {cardErrors.last4 && (
                                        <div className="bps-error">
                                            {cardErrors.last4}
                                        </div>
                                    )}
                                </label>

                                <label>
                                    Exp month (MM)
                                    <input
                                        className="input-base"
                                        value={cardForm.expMonth}
                                        onChange={(e) =>
                                            setCardForm((prev) => ({
                                                ...prev,
                                                expMonth: e.target.value,
                                            }))
                                        }
                                    />
                                    {cardErrors.expMonth && (
                                        <div className="bps-error">
                                            {cardErrors.expMonth}
                                        </div>
                                    )}
                                </label>

                                <label>
                                    Exp year (YYYY)
                                    <input
                                        className="input-base"
                                        value={cardForm.expYear}
                                        onChange={(e) =>
                                            setCardForm((prev) => ({
                                                ...prev,
                                                expYear: e.target.value,
                                            }))
                                        }
                                    />
                                    {cardErrors.expYear && (
                                        <div className="bps-error">
                                            {cardErrors.expYear}
                                        </div>
                                    )}
                                </label>

                                <label className="bps-col-span-2 bps-checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={cardForm.isDefault}
                                        onChange={(e) =>
                                            setCardForm((prev) => ({
                                                ...prev,
                                                isDefault: e.target.checked,
                                            }))
                                        }
                                    />{" "}
                                    Set as default
                                </label>
                            </div>

                            <div className="bps-actions">
                                <button
                                    onClick={submitCardModal}
                                    disabled={cardSaving}
                                    className={`bps-btn ${
                                        !cardSaving ? "bps-primary" : "bps-disabled"
                                    }`}
                                >
                                    {cardSaving ? "Saving..." : "Save card"}
                                </button>
                                <button
                                    onClick={closeCardModal}
                                    className="bps-btn bps-outline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {confirmation && (
                    <Modal
                        roleLabel="Confirm action"
                        onClose={closeConfirmModal}
                        refNode={confirmModalRef}
                    >
                        <div>
                            <h3 className="bps-section-title">Are you sure?</h3>
                            <div className="bps-sub">This action cannot be undone.</div>
                            <div className="bps-actions">
                                <button
                                    onClick={handleConfirm}
                                    className="bps-btn bps-danger"
                                >
                                    Yes, delete
                                </button>
                                <button
                                    onClick={cancelConfirm}
                                    className="bps-btn bps-outline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>

            <Footer />
        </>
    );
}

const Modal = ({ children, onClose, roleLabel = "Dialog", refNode }) => {
    function onBackdropClick(e) {
        if (e.target === e.currentTarget) onClose();
    }

    return (
        <div
            className="modal-backdrop"
            onMouseDown={onBackdropClick}
            role="presentation"
        >
            <div
                className="modal-panel"
                role="dialog"
                aria-label={roleLabel}
                aria-modal="true"
                ref={refNode}
            >
                {children}
            </div>
        </div>
    );
};
